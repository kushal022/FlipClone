import { Step, StepLabel, Stepper } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatDateTime, formatDate } from "../../../utils/functions";

const Tracker = ({ activeStep, orderOn, orderStatus }) => {
  // Enhanced steps configuration that matches your order status flow
  const steps = [
    {
      status: "Pending",
      description: "Order received and pending",
      icon: "🟡",
    },
    {
      status: "Confirmed",
      description: "Order confirmed",
      icon: "🔵",
    },
    {
      status: "Processing", 
      description: "Processing your order",
      icon: "🟣",
    },
    {
      status: "Shipped",
      description: "Item has been shipped",
      icon: "🟠",
    },
    {
      status: "Out For Delivery",
      description: "Out for delivery", 
      icon: "🚚",
    },
    {
      status: "Delivered",
      description: "Successfully delivered",
      icon: "✅",
    },
  ];

  // Map order status to step index for your specific flow
  const statusToStepMap = {
    "Pending": 0,
    "Confirmed": 1,
    "Processing": 2,
    "Shipped": 3,
    "Out For Delivery": 4,
    "Delivered": 5,
    "Cancelled": -1,
    "Returned": -1
  };

  // Use provided activeStep or calculate from orderStatus
  const calculatedActiveStep = activeStep !== undefined ? activeStep : 
    (orderStatus ? statusToStepMap[orderStatus] : 0);

  // Custom icons with better styling
  const CompletedIcon = () => (
    <span className="text-green-500 flex items-center justify-center">
      <CheckCircleIcon sx={{ fontSize: "20px" }} />
    </span>
  );

  const CurrentIcon = () => (
    <span className="text-blue-500 animate-pulse flex items-center justify-center">
      <CircleIcon sx={{ fontSize: "20px", fontWeight: 'bold' }} />
    </span>
  );

  const PendingIcon = () => (
    <span className="text-gray-300 flex items-center justify-center">
      <CircleIcon sx={{ fontSize: "16px" }} />
    </span>
  );

  // Get appropriate icon for each step
  const getStepIcon = (stepIndex) => {
    if (calculatedActiveStep > stepIndex) {
      return <CompletedIcon />;
    } else if (calculatedActiveStep === stepIndex) {
      return <CurrentIcon />;
    } else {
      return <PendingIcon />;
    }
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex) => calculatedActiveStep > stepIndex;

  // Check if step is current active step
  const isStepActive = (stepIndex) => calculatedActiveStep === stepIndex;

  // Handle cancelled or returned orders
  if (orderStatus === "Cancelled" || orderStatus === "Returned") {
    return (
      <div className="w-full py-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-1">
            Order {orderStatus.toLowerCase()}
          </h3>
          <p className="text-gray-600 text-sm">
            This order has been {orderStatus.toLowerCase()}
          </p>
          {orderOn && (
            <p className="text-gray-500 text-xs mt-2">
              Ordered on {formatDate(orderOn)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <Stepper 
        activeStep={calculatedActiveStep} 
        alternativeLabel
        sx={{
          '& .MuiStepConnector-line': {
            borderColor: '#d1d5db', // gray-300
          },
          '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
            borderColor: '#3b82f6', // blue-500
          },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
            borderColor: '#10b981', // green-500
          },
        }}
      >
        {steps.map((step, index) => (
          <Step
            key={step.status}
            active={isStepActive(index)}
            completed={isStepCompleted(index)}
            sx={{
              '& .MuiStepLabel-root': {
                padding: '0 8px',
              }
            }}
          >
            <StepLabel 
              icon={getStepIcon(index)}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginTop: '4px',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#3b82f6', // blue-500
                  fontWeight: 700,
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#10b981', // green-500
                },
              }}
            >
              <div className="flex flex-col items-center">
                <span className={`text-sm font-medium ${
                  isStepCompleted(index) ? 'text-green-600' :
                  isStepActive(index) ? 'text-blue-600' :
                  'text-gray-400'
                }`}>
                  {step.status}
                </span>
                
                {/* Step description */}
                <span className={`text-xs mt-1 ${
                  isStepCompleted(index) ? 'text-green-500' :
                  isStepActive(index) ? 'text-blue-500' :
                  'text-gray-400'
                }`}>
                  {step.description}
                </span>
                
                {/* Show order date only for the first step when completed */}
                {index === 0 && isStepCompleted(index) && orderOn && (
                  <span className="text-xs text-gray-500 mt-1">
                    {formatDateTime(orderOn)}
                  </span>
                )}
                
                {/* Current step indicator */}
                {isStepActive(index) && (
                  <span className="text-xs text-blue-600 font-medium mt-1 animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">
              {steps[calculatedActiveStep]?.status || "Pending"}
            </h4>
            <p className="text-sm text-blue-700">
              {steps[calculatedActiveStep]?.description || "Processing your order"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">
              Step {calculatedActiveStep + 1} of {steps.length}
            </p>
            <p className="text-xs text-blue-600">
              {Math.round(((calculatedActiveStep + 1) / steps.length) * 100)}% Complete
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ 
              width: `${((calculatedActiveStep + 1) / steps.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Current Status Badge */}
      <div className="mt-4 flex justify-center">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          orderStatus === "Delivered" ? "bg-green-100 text-green-800" :
          orderStatus === "Shipped" ? "bg-orange-100 text-orange-800" :
          orderStatus === "Out For Delivery" ? "bg-indigo-100 text-indigo-800" :
          orderStatus === "Processing" ? "bg-purple-100 text-purple-800" :
          orderStatus === "Confirmed" ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          Current Status: {orderStatus || "Pending"}
        </div>
      </div>
    </div>
  );
};

export default Tracker;


// import { Step, StepLabel, Stepper } from "@mui/material";
// import CircleIcon from "@mui/icons-material/Circle";
// import { formatDateTime } from "../../../utils/functions";

// const Tracker = ({ activeStep, orderOn }) => {
//   const steps = [
//     {
//       status: "Ordered",
//       dt: formatDateTime(orderOn),
//     },
//     {
//       status: "Shipped",
//     },
//     {
//       status: "Out For Delivery",
//     },
//     {
//       status: "Delivered",
//     },
//   ];

//   const completedIcon = (
//     <span className="text-green-500 animate-pulse">
//       <CircleIcon sx={{ fontSize: "16px" }} />
//     </span>
//   );
//   const pendingIcon = (
//     <span className="text-gray-400">
//       <CircleIcon sx={{ fontSize: "16px" }} />
//     </span>
//   );

//   return (
//     <Stepper activeStep={activeStep} alternativeLabel>
//       {steps?.map((item, index) => (
//         <Step
//           key={index}
//           active={activeStep === index ? true : false}
//           completed={activeStep >= index ? true : false}
//         >
//           <StepLabel icon={activeStep >= index ? completedIcon : pendingIcon}>
//             {activeStep >= index ? (
//               <span className="text-green-500 font-medium">
//                 {item.status}
//               </span>
//             ) : (
//               <span className="text-gray-400 font-medium">{item.status}</span>
//             )}
//           </StepLabel>
//         </Step>
//       ))}
//     </Stepper>
//   );
// };

// export default Tracker;
