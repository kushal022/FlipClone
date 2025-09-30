import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector } from "react-redux";

const EditAddress = ({ address, setIsEdit }) => {
  const API_URL = import.meta.env.VITE_SERVER_URL;
  const { token } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    street: address?.street || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    country: address?.country || "",
    pincode: address?.pincode || "",
    state: address?.state || "",
    isDefault: address?.isDefault || false,
    addressType: address?.addressType || "Home",
  });

  // Validation rules for fields
  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only characters allowed";
        break;
      case "phone":
        if (!/^[0-9]{10}$/.test(value))
          return "Enter a valid 10-digit phone number";
        break;
      case "pincode":
        if (!/^[0-9]{6}$/.test(value)) return "Enter a valid 6-digit pincode";
        break;
      case "street":
        if (!value.trim()) return "Street is required";
        break;
      case "city":
        if (!value.trim()) return "City is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only characters allowed";
        break;
      case "state":
        if (!value.trim()) return "State is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only characters allowed";
        break;
      case "country":
        if (!value.trim()) return "Country is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only characters allowed";
        break;
      default:
        return "";
    }
    return "";
  };

  // Handle input change + validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    const errorMsg = validateField(name, fieldValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Final validation on submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "isDefault") {
        // Skip checkbox from validation
        const errorMsg = validateField(key, formData[key]);
        if (errorMsg) newErrors[key] = errorMsg;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.put(
        `${API_URL}/api/v1/address/${address._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Address updated successfully!");
        handleClose();
      }
    } catch (error) {
      console.error("Error in Edit Address: ", error);
      toast.error("Error updating address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsEdit(false);
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "primary.dark",
          color: "white",
          py: 1,
        }}
      >
        <Typography variant="h6" component="span">
          Edit Address
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3, mt: 5 }}>
        {isSubmitting ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={400}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                size="small"
                required
              />

              {/* Phone Number */}
              <TextField
                fullWidth
                label="Mobile Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                size="small"
                required
              />

              {/* Address Type */}
              <TextField
                fullWidth
                select
                label="Address Type"
                name="addressType"
                value={formData.addressType}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              {/* Landmark */}
              <TextField
                fullWidth
                label="Landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                size="small"
              />

              {/* Street */}
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                error={!!errors.street}
                helperText={errors.street}
                size="small"
                required
              />

              {/* City */}
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
                size="small"
                required
              />

              {/* State */}
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!errors.state}
                helperText={errors.state}
                size="small"
                required
              />

              {/* Country */}
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country}
                size="small"
                required
              />

              {/* Pincode */}
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                error={!!errors.pincode}
                helperText={errors.pincode}
                size="small"
                required
              />
            </Box>

            {/* Default Address Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Set as default address"
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="primary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "warning.main",
            color: "white.main",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "warning.dark",
            },
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Update Address"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAddress;

// import React, { useState } from "react";
// import Spinner from "../Spinner";
// import { AiFillCloseCircle, AiFillDownCircle } from "react-icons/ai";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import AddressList from "./AddressList";

// const EditAddress = ({ address, setIsEdit }) => {
//   const API_URL = import.meta.env.VITE_SERVER_URL;
//   const { token } = useSelector(state => state.auth)
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [formData, setFormData] = useState({
//     fullName: address.fullName,
//     phone: address.phone,
//     street: address.street,
//     landmark: address.landmark,
//     city: address.city,
//     country: address.country,
//     pincode: address.pincode,
//     state: address.state,
//     isDefault: false,
//     addressType: address.addressType,
//   });

//   // Validation rules for fields
//   const validateField = (name, value) => {
//     switch (name) {
//       case "fullName":
//         if (!value.trim()) return "Full name is required";
//         if (value.length < 3) return "Name must be at least 3 characters";
//         if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
//         break;
//       case "phone":
//         if (!/^[0-9]{10}$/.test(value)) return "Enter a valid 10-digit phone number";
//         break;
//       case "pincode":
//         if (!/^[0-9]{6}$/.test(value)) return "Enter a valid 6-digit pincode";
//         break;
//       case "street":
//         if (!value.trim()) return "Street is required";
//         break;
//       case "city":
//         if (!value.trim()) return "City is required";
//         if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
//         break;
//       case "state":
//         if (!value.trim()) return "State is required";
//         if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
//         break;
//       case "country":
//         if (!value.trim()) return "Country is required";
//         if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
//         break;
//       default:
//         return "";
//     }
//     return "";
//   };

//   // Handle input change + validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     const errorMsg = validateField(name, value);
//     setErrors((prev) => ({ ...prev, [name]: errorMsg }));
//   };

//   // Final validation on submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//     let newErrors = {};
//     Object.keys(formData).forEach((key) => {
//       const errorMsg = validateField(key, formData[key]);
//       if (errorMsg) newErrors[key] = errorMsg;
//     });

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     setIsSubmitting(true);

//       const res = await axios.put(
//         `${API_URL}/api/v1/address/${address._id}`,
//         formData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       console.log(res.data)
//       res.data.success === true &&
//       toast.success("Address updated successfully!") &&
//       handleClose()&&
//       setIsSubmitting(false);

//     } catch (error) {
//       console.error("Error in Edit Address: ", error)
//       toast.error("Error in Edit Address")
//     }
//   };

//   const handleClose = () => {
//     setIsEdit(false)
//   }

//   return (
//     <>
//       {isSubmitting ? (
//         <Spinner />
//       ) : (
//         <div className="flex flex-col h-fit w-full bg-white shadow-[0px_0px_8px_2px_rgba(212,212,212,0.6)] transition-all">
//           <div className="flex justify-end text-white font-bold px-6 p-1 uppercase bg-blue-200 transition-all ">
//             <button
//               onClick={handleClose}
//               className={`flex gap-2 cursor-pointer hover:bg-blue-300 p-2 rounded `}
//             >
//               <span>Cancel</span>
//               <p ><AiFillCloseCircle size={25} /></p>
//             </button>
//           </div>
//           <form
//             onSubmit={handleSubmit}
//             className={`w-full h-fit px-0 pb-8 transition-all`}
//           >
//             <div className="text-base leading-6 border border-gray-200 rounded p-5 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
//               <section className="grid md:grid-cols-2 gap-3 pb-1">
//                 {/* Full Name */}
//                 <div className="relative pt-1">
//                   <input
//                     id="fullName"
//                     name="fullName"
//                     type="text"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-6 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
//                     placeholder="Full Name"
//                   />
//                   <label
//                     htmlFor="fullName"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-1 transition-all peer-focus:-top-3"
//                   >
//                     Full Name
//                   </label>
//                   {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
//                 </div>

//                 {/* Phone Number */}
//                 <div className="relative">
//                   <input
//                     id="phone"
//                     name="phone"
//                     type="text"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="Mobile Number"
//                   />
//                   <label
//                     htmlFor="phone"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     Mobile Number
//                   </label>
//                   {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
//                 </div>

//                 {/* Address Type + Landmark */}
//                 <div className="flex items-baseline justify-between gap-6 flex-col md:flex-row">
//                   <div className="relative">
//                     <select
//                       name="addressType"
//                       value={formData.addressType}
//                       onChange={handleChange}
//                       className="border-b-2 focus:outline-none focus:border-blue-400 mb-2 pb-2 text-gray-600 text-xs"
//                     >
//                       <option value="" disabled>
//                         Address Type
//                       </option>
//                       <option value="Home">Home</option>
//                       <option value="Work">Work</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                   <div className="relative w-full">
//                     <input
//                       id="landmark"
//                       name="landmark"
//                       type="text"
//                       value={formData.landmark}
//                       onChange={handleChange}
//                       className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                       placeholder="landmark"
//                     />
//                     <label
//                       htmlFor="landmark"
//                       className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                     >
//                       Landmark
//                     </label>
//                   </div>
//                 </div>

//                 {/* Street */}
//                 <div className="relative">
//                   <input
//                     id="street"
//                     name="street"
//                     type="text"
//                     value={formData.street}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="Street"
//                   />
//                   <label
//                     htmlFor="street"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     Street
//                   </label>
//                   {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}
//                 </div>

//                 {/* City */}
//                 <div className="relative">
//                   <input
//                     id="city"
//                     name="city"
//                     type="text"
//                     value={formData.city}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="City"
//                   />
//                   <label
//                     htmlFor="city"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     City
//                   </label>
//                   {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
//                 </div>

//                 {/* State */}
//                 <div className="relative">
//                   <input
//                     id="state"
//                     name="state"
//                     type="text"
//                     value={formData.state}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="State"
//                   />
//                   <label
//                     htmlFor="state"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     State
//                   </label>
//                   {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
//                 </div>

//                 {/* Country */}
//                 <div className="relative">
//                   <input
//                     id="country"
//                     name="country"
//                     type="text"
//                     value={formData.country}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="Country"
//                   />
//                   <label
//                     htmlFor="country"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     Country
//                   </label>
//                   {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
//                 </div>

//                 {/* Pincode */}
//                 <div className="relative">
//                   <input
//                     id="pincode"
//                     name="pincode"
//                     type="text"
//                     value={formData.pincode}
//                     onChange={handleChange}
//                     className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
//                     placeholder="Pincode"
//                   />
//                   <label
//                     htmlFor="pincode"
//                     className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
//                   >
//                     Pincode
//                   </label>
//                   {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
//                 </div>
//               </section>

//               {/* Submit */}
//               <div className="relative mt-5 md:mt-8 flex flex-col">
//                 <button
//                   type="submit"
//                   className="bg-yellow-300 uppercase text-blue-600 text-[14px] font-[500] rounded-sm px-2 py-1 cursor-pointer hover:bg-yellow-400 hover:shadow transition-all"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       )}
//     </>
//   );
// };

// export default EditAddress;
