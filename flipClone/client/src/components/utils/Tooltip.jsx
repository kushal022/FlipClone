import Tooltip from "@mui/material/Tooltip";

// Reusable styled Tooltip
const Tooltips = ({ title, children, placement = "top" }) => {
  return (
    <Tooltip
      title={title}
      arrow
      placement={placement}
      slotProps={{
        popper: {
          sx: {
            "& .MuiTooltip-tooltip": {
            //   backgroundColor: "#1f2937", // Tailwind gray-800
              backgroundColor: "#FFFFFF", // Tailwind white
            //   color: "#facc15",           // Tailwind yellow-400
              color: "#3B82F6",           // Tailwind blue-500
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            },
            "& .MuiTooltip-arrow": {
              color: "#1f2937",
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default Tooltips;
