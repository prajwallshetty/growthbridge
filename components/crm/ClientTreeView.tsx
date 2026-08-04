"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCRM, CRMClient } from "./CRMProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Gift,
  Award,
  Share2,
  SlidersHorizontal,
  CheckCircle2,
  X,
  MousePointer,
  Hand,
  Filter,
  Grid,
  Minimize2,
  Maximize2,
  MoreVertical,
  Trash2,
  Eye,
  UserPlus,
  Folder,
  Settings,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Link2,
} from "lucide-react";
import dagre from "dagre";
import { create } from "zustand";

const EASE = [0.22, 1, 0.36, 1] as const;

// ---------------------------------------------------------
// ZUSTAND CANVAS STORE
// ---------------------------------------------------------
interface GroupNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasState {
  collapsedNodes: Record<string, boolean>;
  customCoords: Record<string, { x: number; y: number }>;
  groupNodes: GroupNodeData[];
  clientGroups: Record<string, string>; // client _id -> group id
  relationshipSubtypes: Record<string, string>; // client _id -> subtype (e.g. Subsidiary, Partner)
  layoutDirection: "TB" | "LR";
  activeTool: "select" | "hand";
  gridType: "dots" | "lines" | "none";
  snapToGrid: boolean;

  toggleCollapse: (id: string) => void;
  setCoords: (id: string, x: number, y: number) => void;
  addGroup: (group: GroupNodeData) => void;
  renameGroup: (id: string, label: string) => void;
  deleteGroup: (id: string) => void;
  assignClientToGroup: (clientId: string, groupId: string | null) => void;
  setRelationshipSubtype: (clientId: string, subtype: string) => void;
  setLayoutDirection: (dir: "TB" | "LR") => void;
  setActiveTool: (tool: "select" | "hand") => void;
  setGridType: (type: "dots" | "lines" | "none") => void;
  setSnapToGrid: (snap: boolean) => void;
  clearLayoutCoords: () => void;
}

const getLocalStorage = (key: string, fallback: any) => {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const useCanvasStore = create<CanvasState>((set) => ({
  collapsedNodes: getLocalStorage("gb_canvas_collapsed", {}),
  customCoords: getLocalStorage("gb_canvas_coords", {}),
  groupNodes: getLocalStorage("gb_canvas_groups", []),
  clientGroups: getLocalStorage("gb_canvas_client_groups", {}),
  relationshipSubtypes: getLocalStorage("gb_canvas_rel_subtypes", {}),
  layoutDirection: getLocalStorage("gb_canvas_direction", "TB"),
  activeTool: "select",
  gridType: getLocalStorage("gb_canvas_grid", "dots"),
  snapToGrid: getLocalStorage("gb_canvas_snap", true),

  toggleCollapse: (id) =>
    set((state) => {
      const collapsedNodes = { ...state.collapsedNodes, [id]: !state.collapsedNodes[id] };
      localStorage.setItem("gb_canvas_collapsed", JSON.stringify(collapsedNodes));
      return { collapsedNodes };
    }),

  setCoords: (id, x, y) =>
    set((state) => {
      const customCoords = { ...state.customCoords, [id]: { x, y } };
      localStorage.setItem("gb_canvas_coords", JSON.stringify(customCoords));
      return { customCoords };
    }),

  addGroup: (group) =>
    set((state) => {
      const groupNodes = [...state.groupNodes, group];
      localStorage.setItem("gb_canvas_groups", JSON.stringify(groupNodes));
      return { groupNodes };
    }),

  renameGroup: (id, label) =>
    set((state) => {
      const groupNodes = state.groupNodes.map((g) => (g.id === id ? { ...g, label } : g));
      localStorage.setItem("gb_canvas_groups", JSON.stringify(groupNodes));
      return { groupNodes };
    }),

  deleteGroup: (id) =>
    set((state) => {
      const groupNodes = state.groupNodes.filter((g) => g.id !== id);
      // Free clients in this group
      const clientGroups = { ...state.clientGroups };
      Object.keys(clientGroups).forEach((clientId) => {
        if (clientGroups[clientId] === id) {
          delete clientGroups[clientId];
        }
      });
      localStorage.setItem("gb_canvas_groups", JSON.stringify(groupNodes));
      localStorage.setItem("gb_canvas_client_groups", JSON.stringify(clientGroups));
      return { groupNodes, clientGroups };
    }),

  assignClientToGroup: (clientId, groupId) =>
    set((state) => {
      const clientGroups = { ...state.clientGroups };
      if (groupId) {
        clientGroups[clientId] = groupId;
      } else {
        delete clientGroups[clientId];
      }
      localStorage.setItem("gb_canvas_client_groups", JSON.stringify(clientGroups));
      return { clientGroups };
    }),

  setRelationshipSubtype: (clientId, subtype) =>
    set((state) => {
      const relationshipSubtypes = { ...state.relationshipSubtypes, [clientId]: subtype };
      localStorage.setItem("gb_canvas_rel_subtypes", JSON.stringify(relationshipSubtypes));
      return { relationshipSubtypes };
    }),

  setLayoutDirection: (layoutDirection) =>
    set(() => {
      localStorage.setItem("gb_canvas_direction", JSON.stringify(layoutDirection));
      return { layoutDirection };
    }),

  setActiveTool: (activeTool) => set({ activeTool }),

  setGridType: (gridType) =>
    set(() => {
      localStorage.setItem("gb_canvas_grid", JSON.stringify(gridType));
      return { gridType };
    }),

  setSnapToGrid: (snapToGrid) =>
    set(() => {
      localStorage.setItem("gb_canvas_snap", JSON.stringify(snapToGrid));
      return { snapToGrid };
    }),

  clearLayoutCoords: () =>
    set(() => {
      localStorage.removeItem("gb_canvas_coords");
      return { customCoords: {} };
    }),
}));

// ---------------------------------------------------------
// CUSTOM BEZIER RELATIONSHIP EDGE
// ---------------------------------------------------------
function CustomRelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const relationshipType = data?.relationshipType || "Referred";
  const isHighlighted = data?.isHighlighted;

  // Determine colors based on relationship types
  let strokeColor = "#6366F1"; // default indigo
  let isAnimated = false;
  let strokeDasharray = "none";

  switch (relationshipType) {
    case "Primary":
      strokeColor = "#111827"; // Dark slate
      break;
    case "Partner":
      strokeColor = "#EC4899"; // Pink
      isAnimated = true;
      break;
    case "Vendor":
      strokeColor = "#EF4444"; // Red
      break;
    case "Distributor":
      strokeColor = "#10B981"; // Emerald green
      break;
    case "Sub Client":
      strokeColor = "#F59E0B"; // Amber
      break;
    case "Dealer":
      strokeColor = "#8B5CF6"; // Purple
      break;
    case "Branch":
      strokeColor = "#06B6D4"; // Cyan
      break;
    case "Supplier":
      strokeColor = "#3B82F6"; // Blue
      break;
    case "Subsidiary":
      strokeColor = "#0EA5E9"; // Light blue
      strokeDasharray = "5,5";
      break;
    case "Parent Company":
      strokeColor = "#4B5563"; // Gray
      break;
    default:
      strokeColor = "#6366F1";
  }

  const edgeStyle = {
    ...style,
    stroke: isHighlighted ? "#111111" : strokeColor,
    strokeWidth: isHighlighted ? 3 : 2,
    strokeDasharray: strokeDasharray,
    transition: "stroke 0.2s, stroke-width 0.2s",
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {/* Animated Dash overlay */}
      {(isAnimated || isHighlighted) && (
        <path
          d={edgePath}
          fill="none"
          stroke={isHighlighted ? "#ffffff" : "#ffffff"}
          strokeWidth={1.5}
          strokeDasharray="6,6"
          className="animate-dash"
          style={{
            animation: "dash 25s linear infinite",
          }}
        />
      )}
      {relationshipType && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: "#ffffff",
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "9px",
              fontFamily: "monospace",
              fontWeight: "bold",
              color: isHighlighted ? "#111111" : strokeColor,
              border: `1px solid ${isHighlighted ? "#111111" : strokeColor}35`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              pointerEvents: "all",
              zIndex: 10,
            }}
          >
            {relationshipType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ---------------------------------------------------------
// CUSTOM FIGMA-STYLE GROUP BOX CONTAINER NODE
// ---------------------------------------------------------
function GroupNodeComponent({ id, data }: any) {
  const { label, clientCount, onRename, onDelete } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(label);

  const handleSave = () => {
    setIsEditing(false);
    if (name.trim()) {
      onRename(id, name.trim());
    }
  };

  return (
    <div className="w-full h-full border-[1.5px] border-dashed border-[#A8A296] bg-[#FCFBF8]/45 rounded-[24px] p-4 flex flex-col justify-between pointer-events-none relative select-none">
      <div className="flex items-center justify-between pointer-events-auto bg-white border border-[#E9E3DA] rounded-xl px-3 py-1.5 shadow-sm max-w-max">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="bg-transparent text-[11px] font-mono font-bold text-[#111111] focus:outline-none w-28"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-mono font-black text-[#111111] cursor-pointer hover:underline"
              onClick={() => setIsEditing(true)}
            >
              {label}
            </span>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded">
              {clientCount} {clientCount === 1 ? "Node" : "Nodes"}
            </span>
          </div>
        )}

        <button
          onClick={() => onDelete(id)}
          className="ml-2 p-1 text-[#6A6A6A] hover:text-red-500 rounded transition-colors"
        >
          <X size={10} />
        </button>
      </div>

      <div className="text-[10px] text-[#A8A296] font-mono font-bold uppercase tracking-wider self-end select-none opacity-60">
        Workspace Group
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// CUSTOM CLIENT CARD NODE
// ---------------------------------------------------------
function ClientNodeComponent({ id, data }: any) {
  const {
    client: c,
    currencySymbol,
    receivedRevenue,
    onView,
    onAddChild,
    onDelete,
    onToggleCollapse,
    layoutDirection,
    isCollapsed,
    hasChildren,
    relationshipSubtype,
    isHighlighted,
  } = data;

  const isHorizontal = layoutDirection === "LR";
  const targetPos = isHorizontal ? Position.Left : Position.Top;
  const sourcePos = isHorizontal ? Position.Right : Position.Bottom;

  const outstanding = Math.max(0, (c.budget || c.projectCost || 0) - receivedRevenue);
  const quotationsCount = c.quotations?.length || 0;
  const openTasksCount = c.tasks?.filter((t: any) => t.status !== "Completed").length || 0;

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `${currencySymbol}${(val / 100000).toFixed(1)}L`;
    }
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  // Status mapping
  const getStatusColor = (stage: string) => {
    if (["Completed", "Project Completed"].includes(stage)) return "bg-emerald-500";
    if (["On Hold"].includes(stage)) return "bg-amber-500";
    if (["Pending", "Lead Created"].includes(stage)) return "bg-slate-400";
    return "bg-indigo-500"; // Active development phases
  };

  // Relationship subtype badge styling
  const getSubtypeStyle = (sub: string) => {
    switch (sub) {
      case "Partner":
        return "bg-pink-50 text-pink-700 border-pink-100";
      case "Subsidiary":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Dealer":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Branch":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";
      case "Vendor":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
  };

    return (
      <div
        className={`w-[340px] bg-white border rounded-[20px] p-5 shadow-[0_6px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 select-none relative ${isHighlighted ? "ring-2 ring-indigo-500 ring-offset-2 scale-102 border-indigo-500" : "border-[#E9E3DA]"
          }`}
      >
        {/* Handles */}
        <Handle
          type="target"
          position={targetPos}
          style={{
            background: "#ffffff",
            width: 8,
            height: 8,
            border: "2px solid #6366F1",
            borderRadius: 99,
          }}
        />
        <Handle
          type="source"
          position={sourcePos}
          style={{
            background: "#ffffff",
            width: 8,
            height: 8,
            border: "2px solid #6366F1",
            borderRadius: 99,
          }}
        />

        {/* Node Content */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-[13px] tracking-wider shrink-0 shadow-sm">
                {c.logo || c.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-[14.5px] font-black text-[#111111] leading-tight truncate" title={c.company}>
                  {c.company}
                </h4>
                <span className="text-[11.5px] text-[#6A6A6A] block truncate mt-0.5">{c.name}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[12.5px]">{c.countryFlag || "🇮🇳"}</span>
              {c.priority && (
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider ${c.priority === "High"
                      ? "bg-red-50 text-red-600"
                      : c.priority === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-50 text-slate-600"
                    }`}
                >
                  {c.priority}
                </span>
              )}
            </div>
          </div>

          {/* Subtype and Status Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            {relationshipSubtype && (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getSubtypeStyle(relationshipSubtype)}`}>
                {relationshipSubtype}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#6A6A6A] bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-0.5 rounded-md">
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(c.stage)}`} />
              <span className="truncate max-w-[120px]">{c.stage}</span>
            </span>
          </div>

          {/* Financial Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#FCFBF8] border border-[#E9E3DA]/80 rounded-xl p-3 font-mono text-center">
            <div className="border-r border-[#E9E3DA]/60">
              <span className="text-[9px] text-[#6A6A6A] uppercase font-bold block">Paid Rev</span>
              <span className="text-[12.5px] font-extrabold text-emerald-700">{formatCurrency(receivedRevenue)}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#6A6A6A] uppercase font-bold block">Outstanding</span>
              <span className="text-[12.5px] font-extrabold text-red-600">{formatCurrency(outstanding)}</span>
            </div>
          </div>

          {/* Action / Metrics Row */}
          <div className="flex items-center justify-between text-[12px] text-[#6A6A6A] mt-0.5 px-0.5">
            <div className="flex items-center gap-3">
              <span title="Quotations" className="flex items-center gap-1">
                <span className="font-bold text-[#111111]">{quotationsCount}</span>
                <span>Quots</span>
              </span>
              <span>•</span>
              <span title="Active Tasks" className="flex items-center gap-1.5">
                <span className="font-bold text-[#111111]">{openTasksCount}</span>
                <span>Tasks</span>
              </span>
            </div>
            <span className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer" onClick={() => onView(c._id)}>
              Inspect →
            </span>
          </div>
        </div>

        {/* Collapse / Expand Toggle Button centered on handles */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(c._id);
            }}
            className={`w-5 h-5 rounded-full bg-white border border-[#E9E3DA] flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-md z-30 pointer-events-auto ${isHorizontal
                ? "absolute right-[-10px] top-1/2 -translate-y-1/2"
                : "absolute bottom-[-10px] left-1/2 -translate-x-1/2"
              }`}
            title={isCollapsed ? "Expand Subtree" : "Collapse Subtree"}
          >
            {isCollapsed ? (
              <Plus size={10} strokeWidth={2.5} />
            ) : (
              <Minimize2 size={9} strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>
    );
}

const nodeTypes = {
  client: ClientNodeComponent,
  groupNode: GroupNodeComponent,
};

const edgeTypes = {
  customEdge: CustomRelationshipEdge,
};

// ---------------------------------------------------------
// MAIN INNER CANVAS CONTROLLER
// ---------------------------------------------------------
function ClientTreeCanvas() {
  const {
    clients,
    updateClient,
    addClient,
    deleteClient,
    settings,
    setView,
    setActiveClientId,
  } = useCRM();

  const {
    collapsedNodes,
    customCoords,
    groupNodes,
    clientGroups,
    relationshipSubtypes,
    layoutDirection,
    activeTool,
    gridType,
    snapToGrid,
    toggleCollapse,
    setCoords,
    addGroup,
    renameGroup,
    deleteGroup,
    assignClientToGroup,
    setRelationshipSubtype,
    setLayoutDirection,
    setActiveTool,
    setGridType,
    setSnapToGrid,
    clearLayoutCoords,
  } = useCanvasStore();

  const { fitView, setCenter, screenToFlowPosition } = useReactFlow();

  // Local State UI Controls
  const [search, setSearch] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Modals / Overlay menus
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; groupId?: string } | null>(null);
  const [connectionDialog, setConnectionDialog] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [newRelSubtype, setNewRelSubtype] = useState("Subsidiary");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [addClientFormData, setAddClientFormData] = useState({
    name: "",
    company: "",
    budget: "250000",
    referredBy: "",
    referralCommissionPct: "5",
    priority: "Medium" as const,
    industry: "Technology",
  });
  const [groupCreateDialog, setGroupCreateDialog] = useState<{ x: number; y: number } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const currencySymbol = settings.currency || "₹";

  // Helpers
  const formatCurrency = useCallback((val: number) => {
    if (val >= 100000) {
      return `${currencySymbol}${(val / 100000).toFixed(2)}L`;
    }
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  }, [currencySymbol]);

  const clientRevenueMap = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      let received = 0;
      if (c.payments && c.payments.length > 0) {
        received = c.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      } else if (c.invoices && c.invoices.length > 0) {
        received = c.invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + (i.amount || 0), 0);
      }
      map[c._id] = received;
    });
    return map;
  }, [clients]);

  // Recursively gather collapsed nodes' children IDs
  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();

    const checkChildren = (parentId: string, parentHidden: boolean) => {
      const children = clients.filter(
        (c) => c.referredBy === parentId || (c.referredBy && c.referredBy === parentId)
      );

      children.forEach((child) => {
        if (parentHidden || collapsedNodes[parentId]) {
          hidden.add(child._id);
          checkChildren(child._id, true);
        } else {
          checkChildren(child._id, false);
        }
      });
    };

    clients.filter((c) => !c.referredBy).forEach((root) => {
      checkChildren(root._id, false);
    });

    return hidden;
  }, [clients, collapsedNodes]);

  // Auto Layout calculation via Dagre
  const applyDagreLayout = useCallback((nodesToLayout: Node[], edgesToLayout: Edge[], direction: "TB" | "LR") => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, nodesep: 90, ranksep: 110 });

    const clientNodes = nodesToLayout.filter((n) => n.type === "client");
    const containerGroups = nodesToLayout.filter((n) => n.type === "groupNode");

    clientNodes.forEach((node) => {
      g.setNode(node.id, { width: 340, height: 230 });
    });

    edgesToLayout.forEach((edge) => {
      if (!edge.hidden) {
        g.setEdge(edge.source, edge.target);
      }
    });

    dagre.layout(g);

    return nodesToLayout.map((node) => {
      if (node.type === "groupNode") return node;

      const dagreNode = g.node(node.id);
      if (!dagreNode) return node;

      let x = dagreNode.x - 170;
      let y = dagreNode.y - 115;

      // Local coordinate conversion if assigned to a group container
      if (node.parentId) {
        const groupNode = containerGroups.find((gn) => gn.id === node.parentId);
        if (groupNode) {
          x = x - groupNode.position.x;
          y = y - groupNode.position.y;
        }
      }

      // Store in Zustand custom coords
      setCoords(node.id, x, y);

      return {
        ...node,
        position: { x, y },
      };
    });
  }, [setCoords]);

  // Build the unified Node/Edge dataset
  const { flowNodes, flowEdges } = useMemo(() => {
    const clientMap = new Map<string, CRMClient>();
    clients.forEach((c) => clientMap.set(c._id, c));

    // 1. Setup group nodes
    const fNodes: Node[] = groupNodes.map((group) => {
      // count clients inside this group
      const count = Object.values(clientGroups).filter((gid) => gid === group.id).length;
      return {
        id: group.id,
        type: "groupNode",
        position: { x: group.x, y: group.y },
        style: { width: group.width, height: group.height },
        data: {
          label: group.label,
          clientCount: count,
          onRename: renameGroup,
          onDelete: deleteGroup,
        },
        dragHandle: ".pointer-events-auto",
      };
    });

    // 2. Setup client nodes
    clients.forEach((c) => {
      const isHidden = hiddenNodeIds.has(c._id);
      if (isHidden) return;

      const receivedRevenue = clientRevenueMap[c._id] || 0;
      const hasChildren = clients.some((child) => child.referredBy === c._id);
      const isCollapsed = collapsedNodes[c._id] || false;

      // Group parent container relation
      const parentGroupId = clientGroups[c._id] || undefined;

      // Position logic: custom coordinate -> fallback layout pos
      const pos = customCoords[c._id] || { x: 0, y: 0 };

      fNodes.push({
        id: c._id,
        type: "client",
        parentId: parentGroupId,
        extent: parentGroupId ? "parent" : undefined,
        position: pos,
        data: {
          client: c,
          currencySymbol,
          receivedRevenue,
          layoutDirection,
          isCollapsed,
          hasChildren,
          relationshipSubtype: relationshipSubtypes[c._id] || (c.referredBy ? "Referred" : undefined),
          isHighlighted: highlightedNodeId === c._id,
          onView: (id: string) => {
            setSelectedNodeId(id);
            setSidebarOpen(true);
          },
          onAddChild: (id: string) => {
            setAddClientFormData((prev) => ({ ...prev, referredBy: id }));
            setIsAddClientOpen(true);
          },
          onDelete: (id: string) => {
            if (confirm("Are you sure you want to delete this client?")) {
              deleteClient(id);
            }
          },
          onToggleCollapse: toggleCollapse,
        },
      });
    });

    // 3. Build edges (connecting lines)
    const fEdges: Edge[] = [];
    clients.forEach((c) => {
      if (!c.referredBy) return;

      const parentExists = clientMap.has(c.referredBy);
      if (!parentExists) return;

      const isHidden = hiddenNodeIds.has(c._id) || hiddenNodeIds.has(c.referredBy);

      // Highlight path logic
      const isHighlighted =
        selectedNodeId === c._id ||
        selectedNodeId === c.referredBy ||
        highlightedNodeId === c._id ||
        highlightedNodeId === c.referredBy;

      fEdges.push({
        id: `edge-${c.referredBy}-${c._id}`,
        source: c.referredBy,
        target: c._id,
        type: "customEdge",
        hidden: isHidden,
        animated: isHighlighted,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? "#111111" : "#6366F1",
          width: 15,
          height: 15,
        },
        data: {
          relationshipType: relationshipSubtypes[c._id] || "Referred",
          isHighlighted,
        },
      });
    });

    return { flowNodes: fNodes, flowEdges: fEdges };
  }, [
    clients,
    groupNodes,
    clientGroups,
    renameGroup,
    deleteGroup,
    hiddenNodeIds,
    clientRevenueMap,
    collapsedNodes,
    customCoords,
    currencySymbol,
    layoutDirection,
    highlightedNodeId,
    relationshipSubtypes,
    selectedNodeId,
    toggleCollapse,
    deleteClient,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Sync dataset whenever client records or local coordinate states update
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Run graph-auto layout
  const triggerAutoLayout = useCallback((directionOverride?: "TB" | "LR") => {
    const dir = directionOverride || layoutDirection;
    const layouted = applyDagreLayout(flowNodes, flowEdges, dir);
    setNodes(layouted);
  }, [flowNodes, flowEdges, layoutDirection, applyDagreLayout, setNodes]);

  // Apply default auto layout once initial data populates
  useEffect(() => {
    if (clients.length > 0 && Object.keys(customCoords).length === 0) {
      triggerAutoLayout();
    }
  }, [clients, customCoords, triggerAutoLayout]);

  // Left side Search Flyer
  const handleSearchNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    const query = search.toLowerCase();
    const found = clients.find(
      (c) => c.company.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
    );

    if (found) {
      // Find node coordinates
      let foundNode = nodes.find((n) => n.id === found._id);
      if (!foundNode) {
        // If node is inside a hidden/collapsed branch, expand its parents
        let parentId = found.referredBy;
        const toExpand: string[] = [];
        while (parentId) {
          const parent = clients.find((c) => c._id === parentId);
          if (parent) {
            toExpand.push(parent._id);
            parentId = parent.referredBy;
          } else {
            break;
          }
        }
        // Expand all parents
        toExpand.forEach((pid) => {
          if (collapsedNodes[pid]) toggleCollapse(pid);
        });
        // We trigger search again after nodes update
        setTimeout(() => {
          const updatedNode = nodes.find((n) => n.id === found._id);
          if (updatedNode) {
            zoomToNode(updatedNode);
          }
        }, 150);
      } else {
        zoomToNode(foundNode);
      }
    }
  };

  const zoomToNode = (node: Node) => {
    let x = node.position.x;
    let y = node.position.y;

    // If node is relative to group parent, convert back to absolute canvas coordinates
    if (node.parentId) {
      const parent = nodes.find((g) => g.id === node.parentId);
      if (parent) {
        x += parent.position.x;
        y += parent.position.y;
      }
    }

    setCenter(x + 170, y + 115, { zoom: 1.3, duration: 900 });
    setHighlightedNodeId(node.id);
    setSelectedNodeId(node.id);
    setSidebarOpen(true);
    setTimeout(() => {
      setHighlightedNodeId(null);
    }, 3200);
  };

  // Drag and Drop node update coordinates
  const onNodeDragStop = useCallback((event: any, draggedNode: any) => {
    if (draggedNode.type === "groupNode") {
      // Store new group coordinates
      const grp = groupNodes.find((g) => g.id === draggedNode.id);
      if (grp) {
        renameGroup(draggedNode.id, grp.label); // quick hack to force update state in store
        // Update group nodes coordinates directly
        const updated = groupNodes.map((g) =>
          g.id === draggedNode.id ? { ...g, x: draggedNode.position.x, y: draggedNode.position.y } : g
        );
        localStorage.setItem("gb_canvas_groups", JSON.stringify(updated));
        useCanvasStore.setState({ groupNodes: updated });
      }
      return;
    }

    // Capture absolute positions to check group overlaps
    let absoluteX = draggedNode.position.x;
    let absoluteY = draggedNode.position.y;

    if (draggedNode.parentId) {
      const parent = nodes.find((g) => g.id === draggedNode.parentId);
      if (parent) {
        absoluteX += parent.position.x;
        absoluteY += parent.position.y;
      }
    }

    // Detect group boxes overlap
    const groupOverlap = nodes.find(
      (n) =>
        n.type === "groupNode" &&
        absoluteX >= n.position.x &&
        absoluteX <= n.position.x + (n.style?.width as number || 500) &&
        absoluteY >= n.position.y &&
        absoluteY <= n.position.y + (n.style?.height as number || 400)
    );

    if (groupOverlap) {
      // Re-position relative to group node
      const relX = absoluteX - groupOverlap.position.x;
      const relY = absoluteY - groupOverlap.position.y;
      assignClientToGroup(draggedNode.id, groupOverlap.id);
      setCoords(draggedNode.id, relX, relY);
    } else {
      // Dragged out of group container
      assignClientToGroup(draggedNode.id, null);
      setCoords(draggedNode.id, absoluteX, absoluteY);
    }
  }, [nodes, groupNodes, assignClientToGroup, setCoords, renameGroup]);

  // Connect handler handle drawing
  const onConnect = useCallback((connection: any) => {
    if (connection.source === connection.target) return;
    setConnectionDialog({ sourceId: connection.source, targetId: connection.target });
  }, []);

  const handleConfirmRelationship = async () => {
    if (!connectionDialog) return;
    try {
      // source is parent referrer, target is referred child
      await updateClient(connectionDialog.targetId, {
        referredBy: connectionDialog.sourceId,
        clientType: "Referred",
      });
      setRelationshipSubtype(connectionDialog.targetId, newRelSubtype);
    } catch (err) {
      console.error("Failed to map connection relationship:", err);
    } finally {
      setConnectionDialog(null);
    }
  };

  // Right-Click Context Menu triggers
  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const onNodeContextMenu = useCallback((event: any, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.type === "client" ? node.id : undefined,
      groupId: node.type === "groupNode" ? node.id : undefined,
    });
  }, []);

  // Close context menu on click canvas
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Canvas Quick Actions handlers
  const handleContextAction = (action: string) => {
    setContextMenu(null);
    if (!contextMenu) return;

    const clientPos = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });

    switch (action) {
      case "new_client":
        setAddClientFormData({
          name: "",
          company: "",
          budget: "250000",
          referredBy: "",
          referralCommissionPct: "5",
          priority: "Medium",
          industry: "Technology",
        });
        setIsAddClientOpen(true);
        break;
      case "new_group":
        setGroupCreateDialog({ x: clientPos.x, y: clientPos.y });
        setNewGroupName("");
        break;
      case "layout_tb":
        setLayoutDirection("TB");
        triggerAutoLayout("TB");
        break;
      case "layout_lr":
        setLayoutDirection("LR");
        triggerAutoLayout("LR");
        break;
      case "fit_view":
        fitView({ duration: 800 });
        break;
      case "center_view":
        setCenter(0, 0, { zoom: 1, duration: 800 });
        break;
      case "delete_client":
        if (contextMenu.nodeId && confirm("Delete this client record?")) {
          deleteClient(contextMenu.nodeId);
          if (selectedNodeId === contextMenu.nodeId) {
            setSelectedNodeId(null);
          }
        }
        break;
      case "delete_group":
        if (contextMenu.groupId && confirm("Delete group box container?")) {
          deleteGroup(contextMenu.groupId);
        }
        break;
      case "inspect_client":
        if (contextMenu.nodeId) {
          setSelectedNodeId(contextMenu.nodeId);
          setSidebarOpen(true);
        }
        break;
      case "open_crm_view":
        if (contextMenu.nodeId) {
          setActiveClientId(contextMenu.nodeId);
          setView("projects");
        }
        break;
      default:
        break;
    }
  };

  const handleCreateGroup = () => {
    if (!groupCreateDialog || !newGroupName.trim()) return;
    addGroup({
      id: `group_${Date.now()}`,
      label: newGroupName.trim(),
      x: groupCreateDialog.x,
      y: groupCreateDialog.y,
      width: 480,
      height: 380,
    });
    setGroupCreateDialog(null);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addClientFormData.name || !addClientFormData.company) return;
    try {
      const isReferred = Boolean(addClientFormData.referredBy);
      await addClient({
        name: addClientFormData.name,
        company: addClientFormData.company,
        budget: Number(addClientFormData.budget) || 200000,
        referredBy: addClientFormData.referredBy || null,
        referralCommissionPct: Number(addClientFormData.referralCommissionPct) || 5,
        clientType: isReferred ? "Referred" : "Direct",
        priority: addClientFormData.priority,
        industry: addClientFormData.industry,
      });
      setIsAddClientOpen(false);
      // Wait for client to seed, then auto layout
      setTimeout(() => {
        triggerAutoLayout();
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard Shortcuts hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut key binds inside form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === "Space") {
        e.preventDefault();
        setActiveTool("hand");
      }
      if (e.key === "Escape") {
        setSelectedNodeId(null);
      }
      if (e.key === "f" || e.key === "F") {
        fitView({ duration: 800 });
      }
      if (e.key === "Delete" && selectedNodeId) {
        if (confirm("Delete this client record?")) {
          deleteClient(selectedNodeId);
          setSelectedNodeId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Space") {
        setActiveTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedNodeId, fitView, deleteClient, setActiveTool]);

  // Export/Download canvas layout setup
  const handleExportJSON = () => {
    const canvasData = {
      groupNodes,
      clientGroups,
      relationshipSubtypes,
      customCoords,
      layoutDirection,
    };
    const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `growthbridge_canvas_layout_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // selected client node data for sidebar
  const selectedClient = useMemo(() => {
    return clients.find((c) => c._id === selectedNodeId) as any;
  }, [clients, selectedNodeId]);

  // statistics panel details calculations
  const globalSummaryStats = useMemo(() => {
    let totalPortfolioBudget = 0;
    let totalPaidRevenue = 0;
    let totalOutstanding = 0;
    let totalCommissionsPaid = 0;
    let referredCount = 0;

    clients.forEach((c) => {
      const budget = c.budget || c.projectCost || 0;
      totalPortfolioBudget += budget;

      const received = clientRevenueMap[c._id] || 0;
      totalPaidRevenue += received;

      if (c.referredBy) {
        referredCount++;
        const commPct = c.referralCommissionPct ?? 5;
        totalCommissionsPaid += (received * commPct) / 100;
      }
    });

    totalOutstanding = Math.max(0, totalPortfolioBudget - totalPaidRevenue);

    // Leaderboard
    const map: Record<string, { client: CRMClient; count: number; earnings: number }> = {};
    clients.forEach((c) => {
      if (c.referredBy) {
        const parent = clients.find((p) => p._id === c.referredBy || p.id === c.referredBy);
        if (parent) {
          if (!map[parent._id]) {
            map[parent._id] = { client: parent, count: 0, earnings: 0 };
          }
          map[parent._id].count += 1;
          const received = clientRevenueMap[c._id] || 0;
          const commPct = c.referralCommissionPct ?? 5;
          map[parent._id].earnings += (received * commPct) / 100;
        }
      }
    });

    const leaderboard = Object.values(map).sort((a, b) => b.earnings - a.earnings || b.count - a.count);

    return {
      totalPortfolioBudget,
      totalPaidRevenue,
      totalOutstanding,
      totalCommissionsPaid,
      referredCount,
      leaderboard,
    };
  }, [clients, clientRevenueMap]);

  return (
    <div className="absolute inset-0 top-16 bottom-0 left-0 md:left-[260px] right-0 bg-[#FCFBF8] flex flex-col overflow-hidden select-none">
      {/* Styles Injection for curved edge path animations */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
        .animate-dash {
          stroke-dasharray: 6,6;
          animation: dash 25s linear infinite;
        }
      `}</style>

      {/* TOP figjam-style settings toolbar */}
      <div className="h-14 border-b border-[#E9E3DA] bg-white flex items-center justify-between px-6 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[14px] text-[#111111]">Client Workspace</span>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
              Canvas Mode
            </span>
          </div>

          <div className="h-4 w-px bg-[#E9E3DA]" />

          {/* Layout Direction Selector */}
          <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] p-0.5 rounded-xl gap-0.5">
            <button
              onClick={() => {
                setLayoutDirection("TB");
                triggerAutoLayout("TB");
              }}
              className={`p-1.5 rounded-lg text-[10.5px] font-bold transition-all ${layoutDirection === "TB" ? "bg-[#111111] text-white shadow-sm" : "text-[#6A6A6A] hover:bg-slate-100"
                }`}
              title="Auto arrange vertically (Top-Bottom)"
            >
              Vertical Tree
            </button>
            <button
              onClick={() => {
                setLayoutDirection("LR");
                triggerAutoLayout("LR");
              }}
              className={`p-1.5 rounded-lg text-[10.5px] font-bold transition-all ${layoutDirection === "LR" ? "bg-[#111111] text-white shadow-sm" : "text-[#6A6A6A] hover:bg-slate-100"
                }`}
              title="Auto arrange horizontally (Left-Right)"
            >
              Horizontal Tree
            </button>
          </div>
        </div>

        {/* Top actions toolbar */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearchNode} className="flex items-center gap-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3 py-1.5 w-60">
            <Search size={12} className="text-[#6A6A6A]" />
            <input
              type="text"
              placeholder="Jump to client node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[11px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none w-full"
            />
          </form>

          {/* Grid Settings */}
          <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setGridType("dots")}
              className={`p-1.5 rounded-lg text-[10px] font-mono font-bold ${gridType === "dots" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:bg-slate-100"
                }`}
            >
              Dots
            </button>
            <button
              onClick={() => setGridType("lines")}
              className={`p-1.5 rounded-lg text-[10px] font-mono font-bold ${gridType === "lines" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:bg-slate-100"
                }`}
            >
              Lines
            </button>
            <button
              onClick={() => setGridType("none")}
              className={`p-1.5 rounded-lg text-[10px] font-mono font-bold ${gridType === "none" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:bg-slate-100"
                }`}
            >
              Off
            </button>
          </div>

          <div className="h-4 w-px bg-[#E9E3DA]" />

          {/* Export Layout & Clear */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 p-2 border border-[#E9E3DA] hover:bg-slate-50 text-[11.5px] font-bold text-[#111111] bg-white rounded-xl shadow-sm transition-all"
            title="Download visual coordinates structure"
          >
            <span>Export Layout</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Reset custom visual layout coordinates?")) {
                clearLayoutCoords();
                setTimeout(() => triggerAutoLayout(), 200);
              }
            }}
            className="p-2 border border-red-200 hover:bg-red-50 text-[11px] font-bold text-red-600 bg-white rounded-xl shadow-sm transition-all"
            title="Re-compute layouts"
          >
            Reset view
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT PANEL */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT floating tool panel (figma-style overlay toolbar) */}
        <div className="absolute left-6 top-6 z-20 flex flex-col bg-white border border-[#E9E3DA] p-1.5 rounded-2xl shadow-lg gap-2 shrink-0">
          <button
            onClick={() => setActiveTool("select")}
            className={`p-2.5 rounded-xl transition-all ${activeTool === "select" ? "bg-[#111111] text-white shadow-sm" : "text-[#6A6A6A] hover:bg-slate-50"
              }`}
            title="Select & Drag Tool (Keyboard V)"
          >
            <MousePointer size={16} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setActiveTool("hand")}
            className={`p-2.5 rounded-xl transition-all ${activeTool === "hand" ? "bg-[#111111] text-white shadow-sm" : "text-[#6A6A6A] hover:bg-slate-50"
              }`}
            title="Pan Hand Tool (Keyboard Space)"
          >
            <Hand size={16} strokeWidth={2.2} />
          </button>

          <div className="h-px bg-[#E9E3DA]" />

          <button
            onClick={() => triggerAutoLayout()}
            className="p-2.5 rounded-xl text-[#6A6A6A] hover:text-[#111111] hover:bg-slate-50 transition-all"
            title="Auto Arrange Layout"
          >
            <Layers size={16} strokeWidth={2.2} />
          </button>

          <button
            onClick={() => handleContextAction("new_group")}
            className="p-2.5 rounded-xl text-[#6A6A6A] hover:text-[#111111] hover:bg-slate-50 transition-all"
            title="Create Custom Box Group"
          >
            <Folder size={16} strokeWidth={2.2} />
          </button>

          <button
            onClick={() => handleContextAction("new_client")}
            className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all"
            title="Create new client"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* CANVAS WORKSPACE MODULE */}
        <div className="flex-1 h-full relative" onClick={onPaneClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onPaneContextMenu={onPaneContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            panOnDrag={activeTool === "hand" ? true : [1, 2]}
            selectionOnDrag={activeTool === "select"}
            snapToGrid={snapToGrid}
            snapGrid={[15, 15]}
            fitView
            className="font-sans text-[#111111]"
          >
            {gridType !== "none" && (
              <Background
                variant={(gridType === "dots" ? "dots" : "lines") as any}
                gap={gridType === "dots" ? 18 : 28}
                size={gridType === "dots" ? 1.5 : 1}
                color="#E9E3DA"
              />
            )}

            {/* Custom controls placement */}
            <Controls
              showInteractive={false}
              position="bottom-left"
              style={{
                borderRadius: 12,
                border: "1px solid #E9E3DA",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "row",
                overflow: "hidden",
                gap: 1,
                background: "#ffffff",
              }}
            />

            <MiniMap
              zoomable
              pannable
              style={{
                borderRadius: 16,
                border: "1px solid #E9E3DA",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                background: "#ffffff",
                right: 24,
                bottom: 24,
                width: 140,
                height: 100,
              }}
            />
          </ReactFlow>

          {/* Context Menu Dropdown Popup */}
          {contextMenu && (
            <div
              className="absolute bg-white border border-[#E9E3DA] p-1.5 rounded-2xl shadow-xl z-50 w-52 flex flex-col font-sans"
              style={{ top: contextMenu.y - 80, left: contextMenu.x - 260 }}
            >
              {contextMenu.nodeId ? (
                <>
                  <button
                    onClick={() => handleContextAction("inspect_client")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#111111] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <Eye size={12} />
                    <span>Inspect Client</span>
                  </button>
                  <button
                    onClick={() => handleContextAction("open_crm_view")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#111111] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <Folder size={12} />
                    <span>Open CRM Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setContextMenu(null);
                      setAddClientFormData((prev) => ({ ...prev, referredBy: contextMenu.nodeId || "" }));
                      setIsAddClientOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#111111] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <UserPlus size={12} />
                    <span>Add Child Client</span>
                  </button>
                  <div className="h-px bg-[#E9E3DA] my-1" />
                  <button
                    onClick={() => handleContextAction("delete_client")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-red-600 hover:bg-red-50 rounded-xl text-left"
                  >
                    <Trash2 size={12} />
                    <span>Delete Client</span>
                  </button>
                </>
              ) : contextMenu.groupId ? (
                <button
                  onClick={() => handleContextAction("delete_group")}
                  className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-red-600 hover:bg-red-50 rounded-xl text-left"
                >
                  <Trash2 size={12} />
                  <span>Delete Group Box</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleContextAction("new_client")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#111111] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <Plus size={12} />
                    <span>New Client Node</span>
                  </button>
                  <button
                    onClick={() => handleContextAction("new_group")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#111111] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <Folder size={12} />
                    <span>Create Group Container</span>
                  </button>
                  <div className="h-px bg-[#E9E3DA] my-1" />
                  <button
                    onClick={() => handleContextAction("layout_tb")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#6A6A6A] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <span>Arrange Vertically</span>
                  </button>
                  <button
                    onClick={() => handleContextAction("layout_lr")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#6A6A6A] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <span>Arrange Horizontally</span>
                  </button>
                  <div className="h-px bg-[#E9E3DA] my-1" />
                  <button
                    onClick={() => handleContextAction("fit_view")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#6A6A6A] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <span>Fit Zoom View</span>
                  </button>
                  <button
                    onClick={() => handleContextAction("center_view")}
                    className="flex items-center gap-2 px-3 py-2 text-[11.5px] font-bold text-[#6A6A6A] hover:bg-slate-50 rounded-xl text-left"
                  >
                    <span>Reset Centering</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR (Inspect selected client details OR global statistics) */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ x: 380, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0.8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-96 border-l border-[#E9E3DA] bg-white h-full flex flex-col overflow-hidden z-20 shrink-0 shadow-2xl relative"
            >
              {/* Close panel arrow */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 left-[-16px] w-6 h-8 rounded-l-xl bg-white border-l border-y border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111] flex items-center justify-center shadow-md z-30"
              >
                <ChevronRight size={14} className="rotate-180" />
              </button>

              {selectedClient ? (
                // VIEW 1: SELECTED CLIENT INSPECTION PANEL
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 font-sans">
                  {/* Client Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-[15px]">
                        {selectedClient.logo || selectedClient.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-black text-[#111111] leading-snug">
                          {selectedClient.company}
                        </h3>
                        <span className="text-[12px] text-[#6A6A6A] block mt-0.5">
                          {selectedClient.name} • {selectedClient.industry || "General"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="p-1 rounded-lg text-[#6A6A6A] hover:text-[#111111] hover:bg-slate-100"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Quick Payout Commission Badge */}
                  {selectedClient.referredBy && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Gift size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono tracking-wider">
                          Referral Agreement
                        </span>
                        <div className="text-[13px] font-extrabold text-emerald-800 mt-0.5">
                          {selectedClient.referralCommissionPct || 5}% Commission Rate
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financial Metrics Card */}
                  <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-4 mb-6 shadow-sm">
                    <h4 className="text-[11px] font-bold text-[#6A6A6A] uppercase font-mono tracking-wider mb-3">
                      Project Financial Summary
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-center mb-4">
                      <div className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl">
                        <span className="text-[9px] text-[#6A6A6A] uppercase block">Project Cost</span>
                        <span className="text-[13px] font-black text-[#111111]">
                          {formatCurrency(selectedClient.budget || selectedClient.projectCost || 0)}
                        </span>
                      </div>
                      <div className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl">
                        <span className="text-[9px] text-[#6A6A6A] uppercase block">Paid Revenue</span>
                        <span className="text-[13px] font-black text-emerald-700">
                          {formatCurrency(clientRevenueMap[selectedClient._id] || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10.5px] font-mono text-[#6A6A6A] mb-1">
                        <span>Payment Completed</span>
                        <span>
                          {(
                            ((clientRevenueMap[selectedClient._id] || 0) /
                              (selectedClient.budget || selectedClient.projectCost || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-[#E9E3DA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((clientRevenueMap[selectedClient._id] || 0) /
                                (selectedClient.budget || selectedClient.projectCost || 1)) *
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details parameters */}
                  <div className="flex flex-col gap-2.5 mb-6 text-[12px]">
                    <div className="flex items-center justify-between border-b border-[#E9E3DA]/60 pb-2">
                      <span className="text-[#6A6A6A] font-medium">Assigned Manager:</span>
                      <span className="font-bold text-[#111111]">{selectedClient.assignee || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E9E3DA]/60 pb-2">
                      <span className="text-[#6A6A6A] font-medium">Lifecycle Stage:</span>
                      <span className="font-bold text-[#111111]">{selectedClient.stage}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E9E3DA]/60 pb-2">
                      <span className="text-[#6A6A6A] font-medium">Country Node:</span>
                      <span className="font-bold text-[#111111]">{selectedClient.countryFlag || "🇮🇳"} India</span>
                    </div>
                    {selectedClient.referredBy && (
                      <div className="flex items-center justify-between border-b border-[#E9E3DA]/60 pb-2">
                        <span className="text-[#6A6A6A] font-medium">Referral Parent:</span>
                        <span className="font-bold text-indigo-700">
                          {clients.find((p) => p._id === selectedClient.referredBy)?.company || "Parent"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Document stats counters */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-3 rounded-xl flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-indigo-600" />
                      <div>
                        <span className="text-[12px] font-bold text-[#111111] block leading-none">
                          {selectedClient.quotations?.length || 0}
                        </span>
                        <span className="text-[9px] text-[#6A6A6A] uppercase font-bold tracking-wider">
                          Quotations
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-3 rounded-xl flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-indigo-600" />
                      <div>
                        <span className="text-[12px] font-bold text-[#111111] block leading-none">
                          {selectedClient.invoices?.length || 0}
                        </span>
                        <span className="text-[9px] text-[#6A6A6A] uppercase font-bold tracking-wider">
                          Invoices
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Client Activity timeline */}
                  <div className="flex-1 flex flex-col min-h-60 mt-2">
                    <h4 className="text-[11px] font-bold text-[#6A6A6A] uppercase font-mono tracking-wider mb-3">
                      Activity Timeline logs
                    </h4>
                    {selectedClient.activity && selectedClient.activity.length > 0 ? (
                      <div className="flex flex-col gap-4 border-l border-[#E9E3DA] pl-3 ml-1">
                        {selectedClient.activity.slice(0, 5).map((act: any, idx: number) => (
                          <div key={idx} className="relative text-[11.5px] leading-tight">
                            <span className="absolute left-[-16.5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                            <div className="font-bold text-[#111111]">{act.text}</div>
                            <span className="text-[10px] text-[#A8A296] block mt-0.5">{act.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11.5px] text-[#6A6A6A] italic">No timeline logs recorded yet.</span>
                    )}
                  </div>

                  {/* Panel footer crm redirect */}
                  <button
                    onClick={() => {
                      setActiveClientId(selectedClient._id);
                      setView("projects");
                    }}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-[12.5px] hover:bg-black transition-all cursor-pointer shadow-sm"
                  >
                    <span>Open CRM Project Workspace</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                // VIEW 2: GLOBAL CRM SUMMARY STATISTICS PANEL
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 font-sans">
                  <div className="flex items-center justify-between mb-5 border-b border-[#E9E3DA] pb-4">
                    <div>
                      <h3 className="text-[16px] font-black text-[#111111]">CRM Metrics Hub</h3>
                      <p className="text-[11.5px] text-[#6A6A6A] mt-0.5">Global overview stats & leaderboard</p>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-lg text-[#6A6A6A] hover:text-[#111111]"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Highlight card */}
                  <div className="bg-[#111111] text-white border border-[#333] rounded-2xl p-4 mb-6 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#A8A296] font-mono block">
                        Network Commission Pool
                      </span>
                      <h4 className="text-[20px] font-extrabold text-white mt-1">
                        {formatCurrency(globalSummaryStats.totalCommissionsPaid)}
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                      <Gift size={18} />
                    </div>
                  </div>

                  {/* Portfolio Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-3.5 rounded-2xl">
                      <span className="text-[8.5px] font-mono text-[#6A6A6A] uppercase font-bold block">
                        Paid Revenue
                      </span>
                      <span className="text-[14px] font-black text-[#111111] block mt-1 font-mono">
                        {formatCurrency(globalSummaryStats.totalPaidRevenue)}
                      </span>
                    </div>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-3.5 rounded-2xl">
                      <span className="text-[8.5px] font-mono text-[#6A6A6A] uppercase font-bold block">
                        Outstanding
                      </span>
                      <span className="text-[14px] font-black text-red-600 block mt-1 font-mono">
                        {formatCurrency(globalSummaryStats.totalOutstanding)}
                      </span>
                    </div>
                  </div>

                  {/* Leaderboard Section */}
                  <div className="flex-1 flex flex-col min-h-60 mt-2">
                    <h4 className="text-[11px] font-bold text-[#6A6A6A] uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      <span>Top Referrers Leaderboard</span>
                    </h4>

                    {globalSummaryStats.leaderboard.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {globalSummaryStats.leaderboard.slice(0, 5).map((entry: any, index: number) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedNodeId(entry.client._id);
                            }}
                            className="bg-[#FCFBF8] border border-[#E9E3DA] hover:border-indigo-300 rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                                #{index + 1}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[12px] font-bold text-[#111111] block truncate leading-none">
                                  {entry.client.company}
                                </span>
                                <span className="text-[10px] text-[#6A6A6A] block mt-1 font-mono">
                                  {entry.count} referred deals
                                </span>
                              </div>
                            </div>

                            <span className="text-[11.5px] font-extrabold text-emerald-700 font-mono">
                              +{formatCurrency(entry.earnings)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11.5px] text-[#6A6A6A] italic">No referral data recorded.</span>
                    )}
                  </div>

                  {/* Auto arranged helper */}
                  <div className="bg-slate-50 border border-[#E9E3DA] p-3 rounded-xl text-[11px] text-[#6A6A6A] mt-6 flex items-center gap-2 leading-tight">
                    <SlidersHorizontal size={13} className="text-[#6A6A6A]" />
                    <span>
                      Workspace layout is synced automatically in real-time in your browser’s localStorage.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closed panel toggle trigger floating handle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 rounded-l-xl bg-white border-l border-y border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111] flex items-center justify-center shadow-lg z-30 transition-all"
            title="Inspect Workspace Panel"
          >
            <ChevronRight size={14} className="rotate-180" />
          </button>
        )}
      </div>

      {/* MODAL 1: ADD / CREATE CLIENT PROJECT SCREEN */}
      {isAddClientOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-[24px] p-6 shadow-2xl relative"
          >
            <h3 className="text-[16px] font-black text-[#111111] mb-4">Create New Client Node</h3>
            <form onSubmit={handleCreateClient} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Client / Owner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addClientFormData.name}
                  onChange={(e) => setAddClientFormData({ ...addClientFormData, name: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/30 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={addClientFormData.company}
                  onChange={(e) => setAddClientFormData({ ...addClientFormData, company: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/30 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Project Cost (INR)</label>
                  <input
                    type="number"
                    value={addClientFormData.budget}
                    onChange={(e) => setAddClientFormData({ ...addClientFormData, budget: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Industry</label>
                  <input
                    type="text"
                    value={addClientFormData.industry}
                    onChange={(e) => setAddClientFormData({ ...addClientFormData, industry: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Parent Referrer Client</label>
                <select
                  value={addClientFormData.referredBy}
                  onChange={(e) => setAddClientFormData({ ...addClientFormData, referredBy: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                >
                  <option value="">(No Referrer / Direct Client)</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {addClientFormData.referredBy && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Referral Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={addClientFormData.referralCommissionPct}
                    onChange={(e) => setAddClientFormData({ ...addClientFormData, referralCommissionPct: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 text-[12.5px] font-bold text-[#6A6A6A] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-[12.5px] font-bold shadow-sm transition-all cursor-pointer"
                >
                  Create Client Node
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: RELATIONSHIP TYPE DIALOG SELECTOR */}
      {connectionDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E9E3DA] w-full max-w-sm rounded-[24px] p-6 shadow-2xl"
          >
            <h3 className="text-[15px] font-black text-[#111111] mb-2 flex items-center gap-1.5">
              <Link2 size={16} className="text-indigo-600" />
              <span>Define Network Relationship</span>
            </h3>
            <p className="text-[11.5px] text-[#6A6A6A] leading-normal mb-4">
              Map the exact relationship subtype representing the connection between these nodes:
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Relationship Type</label>
                <select
                  value={newRelSubtype}
                  onChange={(e) => setNewRelSubtype(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                >
                  <option value="Primary">Primary Client</option>
                  <option value="Partner">Equity Partner</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Sub Client">Sub Client</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Branch">Branch Node</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Subsidiary">Subsidiary Company</option>
                  <option value="Parent Company">Parent Company</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[#E9E3DA]">
                <button
                  onClick={() => setConnectionDialog(null)}
                  className="px-4 py-2 text-[12.5px] font-bold text-[#6A6A6A] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRelationship}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold shadow-sm transition-all"
                >
                  Link Nodes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DIALOG 3: CREATE GROUP CONTAINER DIALOG */}
      {groupCreateDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E9E3DA] w-full max-w-sm rounded-[24px] p-6 shadow-2xl"
          >
            <h3 className="text-[15px] font-black text-[#111111] mb-2">Create Workspace Group</h3>
            <p className="text-[11.5px] text-[#6A6A6A] leading-normal mb-4">
              Add a container group to visually wrap and categorize nodes inside regions (e.g. Mangalore) or networks.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">Group Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dealer Network"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[#E9E3DA]">
                <button
                  onClick={() => setGroupCreateDialog(null)}
                  className="px-4 py-2 text-[12.5px] font-bold text-[#6A6A6A] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-black text-white text-[12.5px] font-bold shadow-sm transition-all"
                >
                  Create Group
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// EXPORT CONTAINER WRAPPED IN REACTFLOWPROVIDER
// ---------------------------------------------------------
export default function ClientTreeView() {
  return (
    <ReactFlowProvider>
      <ClientTreeCanvas />
    </ReactFlowProvider>
  );
}
