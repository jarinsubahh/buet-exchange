import { Department } from "@/types";

interface DepartmentTabsProps {
  selected: Department;
  onSelect: (dept: Department) => void;
}

const departments: Department[] = [
  "ALL",
  "CSE",
  "EEE",
  "ME",
  "CE",
  "ChE",
  "BME",
  "IPE",
  "MME",
  "NAME",
  "WRE",
  "ARCH",
  "NCE",
  "URP",
];

const DepartmentTabs = ({ selected, onSelect }: DepartmentTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {departments.map((dept) => (
        <button
          key={dept}
          onClick={() => onSelect(dept)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            selected === dept
              ? "tab-active"
              : "tab-inactive"
          }`}
        >
          {dept}
        </button>
      ))}
    </div>
  );
};

export default DepartmentTabs;
