import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-[32px] group/bento transition duration-300 p-5 bg-[#FAFAF8] border border-[#0D0D0D]/10 justify-between flex flex-col space-y-4 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(13,13,13,0.12)]",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-[#0D0D0D] mb-2 mt-4 text-xl">
          {title}
        </div>
        <div className="font-sans font-normal text-[#0D0D0D]/70 text-sm leading-6">
          {description}
        </div>
      </div>
    </div>
  );
};
