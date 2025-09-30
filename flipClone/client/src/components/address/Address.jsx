import React, { useState } from "react";
import Spinner from "../Spinner";
import { AiFillDownCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector } from "react-redux";
import AddressList from "./AddressList";

const Address = ({ title, setAddNewAddress, open }) => {
  const API_URL = import.meta.env.VITE_SERVER_URL;
  const { token } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    country: "India",
    pincode: "",
    state: "",
    isDefault: false,
    addressType: "Home",
  });

  // Validation rules for fields
  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
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
        if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
        break;
      case "state":
        if (!value.trim()) return "State is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
        break;
      case "country":
        if (!value.trim()) return "Country is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Ony characters allowed";
        break;
      default:
        return "";
    }
    return "";
  };

  // Handle input change + validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Final validation on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let newErrors = {};
      Object.keys(formData).forEach((key) => {
        const errorMsg = validateField(key, formData[key]);
        if (errorMsg) newErrors[key] = errorMsg;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setIsSubmitting(true);

      const res = await axios.post(`${API_URL}/api/v1/address`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      res.data.success === true &&
        toast.success("Address added successfully!") &&
        setView(false) &&
        setIsSubmitting(false);
    } catch (error) {
      console.error("Error in submit Address: ", error);
      toast.error("Error in submit Address");
    }
  };

  return (
    <>
      {isSubmitting ? (
        <Spinner />
      ) : (
        <div
          className={`${
            open ? "" : "hidden"
          } flex flex-col h-fit w-full bg-white shadow-[0px_0px_8px_2px_rgba(212,212,212,0.6)] transition-all`}
        >
          {/* <div className="flex justify-between text-white font-bold px-6 p-3 uppercase bg-blue-500 transition-all ">
            <p className="uppercase">{title}</p>
            <button
              onClick={() => setView(!view)}
              className={`flex gap-2 cursor-pointer `}
            >
              <span>Add New</span>
              <p className={`${view ? "rotate-180" : ""}`}><AiFillDownCircle size={25} /></p>
            </button>
          </div> */}
          {/* <div className="mx-0 my-1"><AddressList/></div> */}

          <form
            onSubmit={handleSubmit}
            className={`w-full h-fit px-0 pb-8 ${
              open ? "block" : "hidden"
            } transition-all`}
          >
            <div className="text-base leading-6 border border-gray-200 rounded p-5 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <section className="grid md:grid-cols-2 gap-3 pb-1">
                {/* Full Name */}
                <div className="relative pt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-6 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                    placeholder="Full Name"
                  />
                  <label
                    htmlFor="fullName"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-1 transition-all peer-focus:-top-3"
                  >
                    Full Name
                  </label>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Mobile Number"
                  />
                  <label
                    htmlFor="phone"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    Mobile Number
                  </label>
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>

                {/* Address Type + Landmark */}
                <div className="flex items-baseline justify-between gap-6 flex-col md:flex-row">
                  <div className="relative">
                    <select
                      name="addressType"
                      value={formData.addressType}
                      onChange={handleChange}
                      className="border-b-2 focus:outline-none focus:border-blue-400 mb-2 pb-2 text-gray-600 text-xs"
                    >
                      <option value="" disabled>
                        Address Type
                      </option>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="relative w-full">
                    <input
                      id="landmark"
                      name="landmark"
                      type="text"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="landmark"
                    />
                    <label
                      htmlFor="landmark"
                      className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                    >
                      Landmark
                    </label>
                  </div>
                </div>

                {/* Street */}
                <div className="relative">
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Street"
                  />
                  <label
                    htmlFor="street"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    Street
                  </label>
                  {errors.street && (
                    <p className="text-red-500 text-xs">{errors.street}</p>
                  )}
                </div>

                {/* City */}
                <div className="relative">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="City"
                  />
                  <label
                    htmlFor="city"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    City
                  </label>
                  {errors.city && (
                    <p className="text-red-500 text-xs">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="relative">
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="State"
                  />
                  <label
                    htmlFor="state"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    State
                  </label>
                  {errors.state && (
                    <p className="text-red-500 text-xs">{errors.state}</p>
                  )}
                </div>

                {/* Country */}
                <div className="relative">
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Country"
                  />
                  <label
                    htmlFor="country"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    Country
                  </label>
                  {errors.country && (
                    <p className="text-red-500 text-xs">{errors.country}</p>
                  )}
                </div>

                {/* Pincode */}
                <div className="relative">
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Pincode"
                  />
                  <label
                    htmlFor="pincode"
                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 transition-all peer-focus:-top-3"
                  >
                    Pincode
                  </label>
                  {errors.pincode && (
                    <p className="text-red-500 text-xs">{errors.pincode}</p>
                  )}
                </div>
              </section>

              {/* Submit */}
              <div className="relative mt-5 md:mt-8 flex gap-4 flex-col md:flex-row">
                <button
                  type="submit"
                  className="bg-orange-500 uppercase text-white text-lg font-[500] rounded-sm px-4 py-1 cursor-pointer hover:bg-orange-400 hover:shadow transition-all"
                >
                  Save and Deliver Here
                </button>
                <div
                  onClick={() => setAddNewAddress(false)}
                  className="bg-white uppercase text-black text-lg font-[500] rounded-sm px-2 py-1 cursor-pointer  hover:shadow transition-all"
                >
                  Cancel
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Address;
