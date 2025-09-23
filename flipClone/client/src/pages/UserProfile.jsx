import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setAuth, updateAuth } from "../redux/slices/auth";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // for toggle edit sections
  const [profile, setProfile] = useState(false); // name
  const [emailSection, setEmailSection] = useState(false);
  const [phoneSection, setPhoneSection] = useState(false);

  // states for editing
  const [email, setEmail] = useState(user?.email);
  const [fname, setFname] = useState(user?.fname);
  const [lname, setLname] = useState(user?.lname);
  const [phone, setPhone] = useState(user?.phone);
  const [nameInputFocused, setNameInputFocused] = useState(false);

  const handleProfile = () => {
    setProfile(!profile); // toggle profile edit mode
  };

  const handleEmail = () => {
    setEmailSection(!emailSection);
  };

  const handlePhone = () => {
    setPhoneSection(!phoneSection);
  };

  // handle for submit updated name:
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfile(false);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/update-details`,
        {
          newFname: fname,
          newLname: lname,
          email: user?.email,
        }
      );
      const updatedUser = response.data.data;
      response.data.success === true &&
      dispatch(updateAuth(updatedUser)) &&
      toast.success(response.data.message);

      response.data.success === false && 
        toast.error(response.data.message);
      
      // localStorage.setItem("auth", JSON.stringify(response.data));
      // localStorage.removeItem("auth");
    } catch (error) {
      console.log(error);
    }
  };

  // handle for submit updated email:
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      setEmailSection(false);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/update-details`,
        {
          newEmail: email,
          email: user?.email,
        }
      );

      const updatedUser = response.data.data;
      response.data.success === true &&
      dispatch(updateAuth(updatedUser)) &&
      toast.success(response.data.message);

      response.data.success === false && 
        toast.error(response.data.message);

      // localStorage.removeItem("auth");
      // localStorage.setItem("auth", JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
    }
  };

  // handle for submit updated name:
  const handlePhoneSubmit = async (e) => {
    setPhoneSection(false);
    e.preventDefault();

    try {
      setProfile(false);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/update-details`,
        {
          newPhone: phone,
          email: user?.email,
        }
      );

      const updatedUser = response.data.data;
      response.data.success === true &&
      dispatch(updateAuth(updatedUser)) &&
      toast.success(response.data.message);

      response.data.success === false && 
        toast.error(response.data.message);
      
    //   localStorage.removeItem("auth");
    //   localStorage.setItem("auth", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error:", error);
      //user not found
      error.response?.status === 404 &&
        error.response.data?.errorType === "invalidUser" &&
        toast.error("User not Found!");
      //server error
      error.response?.status === 500 &&
        toast.error("Something went wrong! Please try after sometime.");
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col items-start p-5 gap-10">
        {/* name section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px] ">Personal Information</div>
            <button
              className="text-[14px] text-blue-500 font-[500]"
              onClick={handleProfile}
            >
              {!profile ? "Edit" : "Cancel"}
            </button>
          </div>
          <div className=" h-[50px]">
            {profile ? (
              <form
                action="/update-details"
                method="post"
                onSubmit={handleNameSubmit}
                className="flex gap-6 items-center"
              >
                <div
                  className={`border-2 p-2 flex flex-col max-h-[50px] min-h-[50px] w-[220px] ${
                    nameInputFocused ? "border-blue-500 border-1" : ""
                  }`}
                >
                  <label htmlFor="fname" className="text-[10px]">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="fname"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    className=" text-[14px] focus:outline-none"
                  />
                </div>
                <div
                  className={`border-2 p-2 flex flex-col max-h-[50px] min-h-[50px] w-[220px] ${
                    nameInputFocused ? "border-blue-500 border-1" : ""
                  }`}
                >
                  <label htmlFor="fname" className="text-[10px]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lname"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    className=" text-[14px] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                  onClick={handleNameSubmit}
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="border-2 p-2 w-[220px] min-h-[50px] text-slate-600 flex items-center">
                {user?.fname + " " + user?.lname}
              </div>
            )}
          </div>
        </div>

        {/* email section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px] ">Email Address</div>
            <button
              className="text-[14px] text-blue-500 font-[500]"
              onClick={handleEmail}
            >
              {!emailSection ? "Edit" : "Cancel"}
            </button>
          </div>
          <div className="flex gap-6 ">
            {emailSection ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 p-2 w-[220px] focus:outline-primaryBlue focus:outline-1"
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" // Email pattern
              />
            ) : (
              <div className="border-2 p-2 w-[220px] text-slate-500">
                {user?.email}
              </div>
            )}

            {emailSection && (
              <button
                className="bg-blue-500 text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                onClick={handleEmailSubmit}
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Mobile section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px] ">Mobile Number</div>
            <button
              className="text-[14px] text-blue-500 font-[500]"
              onClick={handlePhone}
            >
              {!phoneSection ? "Edit" : "Cancel"}
            </button>
          </div>
          <div className="flex gap-6 ">
            {phoneSection ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-2 p-2 w-[220px] focus:outline-primaryBlue focus:outline-1"
                inputMode="numeric" // Set input mode to numeric
                pattern="[0-9]*"
                minLength="10"
                maxLength="10"
              />
            ) : (
              <div className="border-2 p-2 w-[220px] text-slate-500">
                {user?.phone}
              </div>
            )}

            {phoneSection && (
              <button
                className="bg-blue-500 text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                onClick={handlePhoneSubmit}
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* FAQ section */}
        <div>
          <h3 className="text-[16px] font-[600] mt-4">FAQs</h3>
          <div className="mt-4">
            <h5 className="text-[14px] font-[500]">
              What happens when I update my email address (or mobile number)?
            </h5>
            <p className="text-[12px] text-slate-500 mt-2">
              Your login email id (or mobile number) changes, likewise.
              You&apos;ll receive all your account related communication on your
              updated email address (or mobile number).
            </p>
          </div>
          <div className="mt-4">
            <h5 className="text-[14px] font-[500]">
              When will my Flipkart account be updated with the new email
              address (or mobile number)?
            </h5>
            <p className="text-[12px] text-slate-500 mt-2">
              It happens as soon as you confirm the verification code sent to
              your email (or mobile) and save the changes.
            </p>
          </div>
          <div className="mt-4">
            <h5 className="text-[14px] font-[500]">
              Does my Seller account get affected when I update my email
              address?
            </h5>
            <p className="text-[12px] text-slate-500 mt-2">
              Flipkart has a single sign-on policy. Any changes will reflect in
              your Seller account also.
            </p>
          </div>
        </div>

        {/* deactivate account */}
        <div className="text-[14px] text-blue-500 font-[500] mt-4 -mb-4">
          <Link to="/admin/dashboard/profile/deactivate">Deactivate Account</Link>
        </div>
      </div>

      {/* image section */}
      <div>
        <img
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/myProfileFooter_4e9fe2.png"
          alt="image"
        />
      </div>
    </div>
  );
};

export default UserProfile;
