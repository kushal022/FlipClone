import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../Spinner";
import EditAddress from "./EditAddress";
import { AiOutlineEdit } from "react-icons/ai";

const AddressList = ({ onSelect, setSelectedAddress }) => {
  const API_URL = import.meta.env.VITE_SERVER_URL;
  const { token } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  // Fetch all addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/address`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        res.data.success === true && setAddresses(res.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching addresses:", err);
        toast.error("Failed to load addresses");
      }
    };
    fetchAddresses();
  }, [API_URL, token, isEdit]);

  // Handle selection
  const handleSelect = (id) => {
    setSelected(id);
    if (onSelect) onSelect(id); // Pass selected address ID to parent
  };

  const handleSelectAddress = (address) => {
    if (setSelectedAddress) setSelectedAddress(address); // Pass selected address ID to parent
  };

  

  // Handle Edit Address:
  const handleEdit = (address) => {
    setEditAddress(address);
    setIsEdit(true);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex bg-white">
            <div className="flex flex-col gap-4 w-full">
              {addresses.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No saved addresses found.
                </p>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-all 
               ${
                 selected === address._id
                   ? "border-blue-500 shadow-md"
                   : "border-gray-200"
               }`}
                    onClick={() => handleSelect(address._id)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        {/* Checkbox/Radio */}
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selected === address._id}
                          onChange={() => handleSelect(address._id)}
                          className="mt-1 cursor-pointer accent-blue-500"
                        />
                        {/* Address Details */}
                        <div className="flex flex-col text-sm text-gray-700">
                          <div className="flex gap-4 items-center">
                            <p className="font-bold">{address.fullName}</p>
                            <span className="text-xs uppercase text-gray-500 bg-gray-300 p-1 rounded font-medium">
                              {address.addressType}{" "}
                              {address.isDefault && "(Default)"}
                            </span>
                            <p className="font-bold">{address.phone}</p>
                          </div>
                          <p className="flex gap-0 md:gap-1 flex-col md:flex-row">
                            <span>{address.street},</span>
                            <span>{address.city},</span>
                            <span>{address.state},</span>
                            <span>
                              {address.country} - {address.pincode}
                            </span>
                          </p>
                          {address.landmark && (
                            <p className="text-gray-500">
                              Landmark: {address.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                      {selected === address._id && (
                        <button onClick={() => handleSelectAddress(address)}
                        className="bg-orange-500 uppercase text-white text-lg font-[500] rounded-sm px-4 py-1 cursor-pointer hover:bg-orange-400 hover:shadow transition-all">
                          Deliver Here
                        </button>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => handleEdit(address)}
                        className="bg-gray-400 p-2 text-gray-100 rounded cursor-pointer hover:text-blue-500 hover:bg-gray-200 transition-all"
                      >
                        <AiOutlineEdit />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            {isEdit && (
              <EditAddress address={editAddress} setIsEdit={setIsEdit} />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AddressList;
