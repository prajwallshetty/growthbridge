"use client";

import React, { useState, useMemo } from "react";
import { useCRM, CRMClient } from "./CRMProvider";
import { motion } from "framer-motion";
import {
  GitFork,
  Search,
  ChevronRight,
  ChevronDown,
  Gift,
  Award,
  Share2,
  SlidersHorizontal,
  CheckCircle2,
  X,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface TreeNode {
  client: CRMClient;
  children: TreeNode[];
  tierLevel: number; // 0 = Root, 1 = Tier 1, 2 = Tier 2+
  receivedRevenue: number;
  referralEarnings: number;
  networkTotalRevenue: number;
  totalNetworkCount: number;
}

export default function ClientTreeView() {
  const { clients, updateClient, settings, setView, setActiveClientId } = useCRM();

  const [search, setSearch] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedClientForReferrer, setSelectedClientForReferrer] = useState<CRMClient | null>(null);
  const [newReferrerId, setNewReferrerId] = useState<string>("");
  const [newCommissionPct, setNewCommissionPct] = useState<number>(5);
  const [isSavingReferrer, setIsSavingReferrer] = useState(false);
  const [tierFilter, setTierFilter] = useState<"all" | "root" | "referred">("all");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    if (val >= 100000) {
      return `${sym}${(val / 100000).toFixed(2)}L`;
    }
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  // Helper map of client revenue
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
      if (c.id) map[c.id] = received;
    });
    return map;
  }, [clients]);

  // Build tree data structure
  const treeData = useMemo(() => {
    const clientMap: Record<string, CRMClient> = {};
    clients.forEach((c) => {
      clientMap[c._id] = c;
      if (c.id) clientMap[c.id] = c;
    });

    const buildNode = (c: CRMClient, tier: number, visited = new Set<string>()): TreeNode => {
      visited.add(c._id);
      
      const directChildren = clients.filter(
        (child) => (child.referredBy === c._id || (child.referredBy && child.referredBy === c.id)) && !visited.has(child._id)
      );

      const childNodes = directChildren.map((child) => buildNode(child, tier + 1, new Set(visited)));
      
      const receivedRevenue = clientRevenueMap[c._id] || 0;

      let referralEarnings = 0;
      let networkTotalRevenue = receivedRevenue;
      let totalNetworkCount = childNodes.length;

      childNodes.forEach((childNode) => {
        const commPct = childNode.client.referralCommissionPct ?? 5;
        referralEarnings += (childNode.receivedRevenue * commPct) / 100;
        networkTotalRevenue += childNode.networkTotalRevenue;
        totalNetworkCount += childNode.totalNetworkCount;
      });

      return {
        client: c,
        children: childNodes,
        tierLevel: tier,
        receivedRevenue,
        referralEarnings,
        networkTotalRevenue,
        totalNetworkCount,
      };
    };

    // Root nodes are clients with no referredBy or referredBy pointing to a non-existing client
    const roots = clients.filter(
      (c) => !c.referredBy || !clientMap[c.referredBy]
    );

    return roots.map((root) => buildNode(root, 0));
  }, [clients, clientRevenueMap]);

  // Expand all by default on load if state empty
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    clients.forEach((c) => {
      initialExpanded[c._id] = true;
    });
    setExpandedNodes(initialExpanded);
  }, [clients]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    clients.forEach((c) => (all[c._id] = true));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Metrics summary
  const summaryStats = useMemo(() => {
    let totalReferredDealsVal = 0;
    let totalCommissionsPaid = 0;
    let referredCount = 0;

    clients.forEach((c) => {
      if (c.referredBy) {
        referredCount++;
        const dealVal = c.budget || c.projectCost || 0;
        totalReferredDealsVal += dealVal;
        const rev = clientRevenueMap[c._id] || 0;
        const pct = c.referralCommissionPct ?? 5;
        totalCommissionsPaid += (rev * pct) / 100;
      }
    });

    // Top referrers leaderboard
    const referrerStatsMap: Record<string, { client: CRMClient; count: number; earnings: number }> = {};

    clients.forEach((c) => {
      if (c.referredBy) {
        const parent = clients.find((p) => p._id === c.referredBy || p.id === c.referredBy);
        if (parent) {
          if (!referrerStatsMap[parent._id]) {
            referrerStatsMap[parent._id] = { client: parent, count: 0, earnings: 0 };
          }
          referrerStatsMap[parent._id].count += 1;
          const rev = clientRevenueMap[c._id] || 0;
          const pct = c.referralCommissionPct ?? 5;
          referrerStatsMap[parent._id].earnings += (rev * pct) / 100;
        }
      }
    });

    const leaderboard = Object.values(referrerStatsMap).sort((a, b) => b.earnings - a.earnings || b.count - a.count);

    return {
      totalReferredDealsVal,
      totalCommissionsPaid,
      referredCount,
      totalClients: clients.length,
      leaderboard,
    };
  }, [clients, clientRevenueMap]);

  // Handle setting referrer
  const handleOpenReferrerModal = (c: CRMClient) => {
    setSelectedClientForReferrer(c);
    setNewReferrerId(c.referredBy || "");
    setNewCommissionPct(c.referralCommissionPct ?? 5);
  };

  const handleSaveReferrer = async () => {
    if (!selectedClientForReferrer) return;
    try {
      setIsSavingReferrer(true);
      const isReferred = Boolean(newReferrerId);
      await updateClient(selectedClientForReferrer._id, {
        referredBy: newReferrerId || null,
        referralCommissionPct: Number(newCommissionPct) || 5,
        clientType: isReferred ? "Referred" : "Direct",
      });
      setSelectedClientForReferrer(null);
    } catch (e) {
      console.error("Failed to update referrer:", e);
    } fontinally: {
      setIsSavingReferrer(false);
    }
  };

  // Filter nodes matching search
  const matchesSearch = (c: CRMClient) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.company.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.industry || "").toLowerCase().includes(q)
    );
  };

  const renderTreeNode = (node: TreeNode) => {
    const { client: c, children, tierLevel, receivedRevenue, referralEarnings } = node;
    const isExpanded = expandedNodes[c._id] ?? true;
    const hasChildren = children.length > 0;
    const isMatch = matchesSearch(c);

    // Parent referrer details
    const parentClient = clients.find((p) => p._id === c.referredBy || p.id === c.referredBy);

    return (
      <div key={c._id} className="flex flex-col items-start relative select-none">
        {/* Node Card */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`w-full max-w-2xl bg-white border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md relative ${
            isMatch ? "border-[#E9E3DA]" : "border-slate-200 opacity-40"
          } ${tierLevel === 0 ? "border-l-4 border-l-indigo-600" : tierLevel === 1 ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left Info */}
            <div className="flex items-center gap-3">
              {/* Logo / Initials */}
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-extrabold text-[13px] tracking-wider shrink-0 shadow-sm">
                {c.logo || c.company.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    onClick={() => {
                      setActiveClientId(c._id);
                      setView("projects");
                    }}
                    className="text-[14.5px] font-extrabold text-[#111111] hover:underline cursor-pointer"
                  >
                    {c.company}
                  </h4>
                  <span className="text-[13px]">{c.countryFlag || "🇮🇳"}</span>

                  {/* Tier Level Tag */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                      tierLevel === 0
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : tierLevel === 1
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {tierLevel === 0 ? "Root Client" : `Tier ${tierLevel} Referred`}
                  </span>
                </div>

                <div className="text-[11.5px] text-[#6A6A6A] flex items-center gap-2 mt-0.5">
                  <span>{c.name}</span>
                  <span>•</span>
                  <span>{c.industry || "Technology"}</span>
                  {parentClient && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Share2 size={10} />
                        Referred by {parentClient.company}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Financial & Action Controls */}
            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div className="text-[13px] font-extrabold text-[#111111]">
                  {formatCurrency(c.budget || c.projectCost || 0)}
                </div>
                <div className="text-[10.5px] text-emerald-600 font-bold">
                  Paid: {formatCurrency(receivedRevenue)}
                </div>
              </div>

              {/* Commission badge if earned */}
              {referralEarnings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1 text-right font-mono shrink-0">
                  <div className="text-[9.5px] text-emerald-700 font-bold uppercase flex items-center gap-1 justify-end">
                    <Gift size={10} />
                    Commission Earned
                  </div>
                  <div className="text-[12px] font-extrabold text-emerald-700">
                    +{formatCurrency(referralEarnings)}
                  </div>
                </div>
              )}

              {/* Edit Referrer Trigger */}
              <button
                onClick={() => handleOpenReferrerModal(c)}
                title="Change Referrer / Commission Rate"
                className="p-2 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111] hover:bg-white transition-all cursor-pointer"
              >
                <SlidersHorizontal size={13} />
              </button>

              {/* Expand/Collapse branch button */}
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(c._id)}
                  className="flex items-center gap-1 p-1.5 px-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="font-mono">{children.length}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-line referral commission rate indicator if referred */}
          {c.referredBy && (
            <div className="mt-2 pt-2 border-t border-[#E9E3DA]/60 flex items-center justify-between text-[11px] text-[#6A6A6A] font-mono">
              <span className="flex items-center gap-1 text-slate-600">
                <span>Referral Payout Agreement:</span>
                <span className="font-bold text-[#111111]">{c.referralCommissionPct ?? 5}% Commission Rate</span>
              </span>
              <span className="text-emerald-700 font-bold">
                Payout Generated: {formatCurrency((receivedRevenue * (c.referralCommissionPct ?? 5)) / 100)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Children Nodes Sub-Tree */}
        {hasChildren && isExpanded && (
          <div className="pl-6 md:pl-10 mt-3 border-l-2 border-dashed border-indigo-200 flex flex-col gap-3 w-full">
            {children.map((childNode) => renderTreeNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-extrabold tracking-tight text-[#111111] leading-tight">
              Client Reference & Referral Tree
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-mono font-bold">
              Multi-Tier Network
            </span>
          </div>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Map client referral origins, compute multi-tier partner commissions, and monitor network growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E9E3DA] text-[12px] font-bold text-[#111111] hover:bg-[#FCFBF8] transition-all cursor-pointer shadow-sm"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E9E3DA] text-[12px] font-bold text-[#6A6A6A] hover:bg-[#FCFBF8] transition-all cursor-pointer shadow-sm"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Referral Deals */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A] tracking-wider">
              Referral Network Volume
            </span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <GitFork size={16} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#111111] font-mono">
            {formatCurrency(summaryStats.totalReferredDealsVal)}
          </div>
          <div className="text-[11.5px] text-[#6A6A6A] mt-1 flex items-center gap-1 font-mono">
            <span className="font-bold text-indigo-700">{summaryStats.referredCount}</span>
            <span>out of {summaryStats.totalClients} deals brought via referrals</span>
          </div>
        </motion.div>

        {/* Metric 2: Total Commissions Paid */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A] tracking-wider">
              Referral Commissions
            </span>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <Gift size={16} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#111111] font-mono">
            {formatCurrency(summaryStats.totalCommissionsPaid)}
          </div>
          <div className="text-[11.5px] text-emerald-600 mt-1 font-mono font-semibold">
            Deducted from gross profit before partner share split
          </div>
        </motion.div>

        {/* Metric 3: Network Ratio */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A] tracking-wider">
              Referral Rate %
            </span>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
              <Share2 size={16} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#111111] font-mono">
            {summaryStats.totalClients > 0
              ? `${Math.round((summaryStats.referredCount / summaryStats.totalClients) * 100)}%`
              : "0%"}
          </div>
          <div className="text-[11.5px] text-[#6A6A6A] mt-1 font-mono">
            Client-driven organic growth ratio
          </div>
        </motion.div>

        {/* Metric 4: Top Referrer */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A] tracking-wider">
              Top Referring Client
            </span>
            <div className="p-2 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
              <Award size={16} />
            </div>
          </div>
          {summaryStats.leaderboard.length > 0 ? (
            <div>
              <div className="text-[15px] font-extrabold text-[#111111] truncate">
                {summaryStats.leaderboard[0].client.company}
              </div>
              <div className="text-[11.5px] text-purple-700 font-mono font-bold mt-0.5">
                {summaryStats.leaderboard[0].count} Referrals • {formatCurrency(summaryStats.leaderboard[0].earnings)} Earned
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-[#6A6A6A] italic">No active referrals recorded yet.</div>
          )}
        </motion.div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#E9E3DA] p-3.5 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3.5 py-2 w-full max-w-md">
          <Search size={14} className="text-[#6A6A6A]" />
          <input
            type="text"
            placeholder="Search by client company, contact, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[13px] text-[#111111] placeholder-[#6A6A6A]/50 focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#6A6A6A] hover:text-[#111111]">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 font-mono text-[11.5px]">
          <span className="text-[#6A6A6A] uppercase font-bold text-[10px] mr-1">Filter Nodes:</span>
          <button
            onClick={() => setTierFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              tierFilter === "all" ? "bg-[#111111] text-white" : "bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A]"
            }`}
          >
            All Clients ({clients.length})
          </button>
          <button
            onClick={() => setTierFilter("root")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              tierFilter === "root" ? "bg-[#111111] text-white" : "bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A]"
            }`}
          >
            Roots ({treeData.length})
          </button>
          <button
            onClick={() => setTierFilter("referred")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              tierFilter === "referred" ? "bg-[#111111] text-white" : "bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A]"
            }`}
          >
            Referred ({summaryStats.referredCount})
          </button>
        </div>
      </div>

      {/* Main Referral Tree Canvas */}
      <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-6 shadow-inner min-h-[450px]">
        {treeData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-[#6A6A6A] font-mono text-[13px] gap-2">
            <GitFork size={28} className="text-[#A8A296]" />
            <span>No client reference nodes match your filters.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {treeData
              .filter((node) => {
                if (tierFilter === "referred") return node.children.length > 0 || Boolean(node.client.referredBy);
                return true;
              })
              .map((rootNode) => renderTreeNode(rootNode))}
          </div>
        )}
      </div>

      {/* Referrer Selector Modal */}
      {selectedClientForReferrer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E9E3DA]">
              <div>
                <h3 className="text-[16px] font-bold text-[#111111]">
                  Edit Client Referrer & Payout Rate
                </h3>
                <p className="text-[11.5px] text-[#6A6A6A]">
                  Target Client: <span className="font-bold text-[#111111]">{selectedClientForReferrer.company}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForReferrer(null)}
                className="p-1 rounded-lg text-[#6A6A6A] hover:text-[#111111] hover:bg-[#FCFBF8]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Referrer Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase font-mono">
                  Parent Referrer Client
                </label>
                <select
                  value={newReferrerId}
                  onChange={(e) => setNewReferrerId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="">(No Referrer / Direct Client)</option>
                  {clients
                    .filter((c) => c._id !== selectedClientForReferrer._id && c.id !== selectedClientForReferrer._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.company} ({c.name})
                      </option>
                    ))}
                </select>
              </div>

              {/* Commission Percentage */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase font-mono">
                  Referral Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={newCommissionPct}
                  onChange={(e) => setNewCommissionPct(parseFloat(e.target.value) || 0)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                <span className="text-[10.5px] text-[#6A6A6A] font-mono">
                  Calculated automatically on all paid revenue received for {selectedClientForReferrer.company}.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setSelectedClientForReferrer(null)}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReferrer}
                  disabled={isSavingReferrer}
                  className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingReferrer && <CheckCircle2 size={14} className="animate-spin" />}
                  <span>Save Referral Link</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
