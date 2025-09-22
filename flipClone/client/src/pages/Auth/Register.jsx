import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import auth from "../../assets/images/auth.png";
import { Link } from "react-router-dom";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import Checkbox from "@mui/material/Checkbox";
// import SeoData from "../../SEO/SeoData";

const Register = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState(
    {
      label: "",
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      isDefault: false,
    },
  );
  const [isSeller, setIsSeller] = useState(false);
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleCheckbox = () => {
    setIsSeller(!isSeller);
  };

  const handleChangeAddress = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  }


  //form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (password !== confirmPassword) {
        toast.error("Password does not match!");
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/register`,
        {
          fname,
          lname,
          email,
          phone,
          password,
          address,
          role: isSeller ? "seller" : "customer",
        }
      );
      console.log(response.data);
      const data = response.data;

      // Registration successful
      data.success === true &&
        toast.success("User Registered Successfully! Please Login...") &&
        navigate("/login");

      // Email already registered
      response.status === 409 &&
        toast.error("Email is already registered! Please Login...") &&
        navigate("/login");
    } catch (error) {
      console.error("Error:", error);

      //server error
      error.response.status === 500 &&
        toast.error("Something went wrong! Please try after sometime.") &&
        navigate("/register");
    } finally {
      setIsSubmitting(false);
    }
  };

  //display content
  return (
    //SEO
    <>
      {/* <SeoData
                title="Sign up - New User"
                description="Register new user with details"
            /> */}
      {isSubmitting ? (
        <Spinner />
      ) : (
        <div className="container h-full bg-primaryBg mt-4 sm:mt-0 md:mt-0 lg:mt-0 py-[2px]">
          <div className="flex items-center flex-col sm:flex-row md:flow-row lg:flex-row my-10 mx-auto w-full sm:w-[70vw] md:w-[70vw] lg:w-[70vw] min-h-[500px] md:h-[90vh] lg:h-[100vh] bg-white shadow-[0px_0px_8px_2px_rgba(212,212,212,0.6)] ">
            {/* left view  */}
            <div className=" w-full md:w-[40%] lg:w-[40%] h-full bg-primaryBlue">
              <div className="flex gap-6 flex-col h-full mt-10 px-6 ">
                <div className="text-gray-500 leading-8 text-[22px] font-[600]">
                  <h2>Looks like you&apos;re new here!</h2>
                </div>
                <div className="text-slate-500 text-[15px] leading-7 font-[400]">
                  <p>Sign up with the required details to get started</p>
                </div>
                <div className="mt-14">
                  <img src={auth} alt="auth image" />
                </div>
              </div>
            </div>

            {/* sign up form */}
            <div className="p-3 w-full h-full  sm:w-[60%] md:w-[60%] lg:w-[60%] ">
              <div className="flex items-center flex-col h-full w-full">
                <form
                  action="/register"
                  method="post"
                  className="w-[90%] h-full mx-auto transition-all"
                  onSubmit={handleFormSubmit}
                >
                  <div className="text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7 pt-3 ">
                    <section className="flex gap-3 w-full justify-between">
                      {/* first name */}
                      <div className="relative ">
                        <input
                          autoComplete="on"
                          id="fname"
                          name="fname"
                          type="text"
                          value={fname}
                          onChange={(e) => setFname(e.target.value)}
                          className="peer placeholder-transparent h-6 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                          placeholder="First Name"
                          required
                          pattern="[A-Za-z]{1,32}" // Only letters, max length 32
                        />
                        <label
                          htmlFor="fname"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-1 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          First Name
                        </label>
                      </div>
                      {/* last name */}
                      <div className="relative ">
                        <input
                          autoComplete="on"
                          id="lname"
                          name="lname"
                          type="text"
                          value={lname}
                          onChange={(e) => setLname(e.target.value)}
                          className="peer placeholder-transparent h-6 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                          placeholder="Last Name"
                          required
                          pattern="[A-Za-z]{1,32}" // Only alphabetic characters
                        />
                        <label
                          htmlFor="lname"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-1 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          Last Name
                        </label>
                      </div>
                    </section>
                    {/* email */}
                    <div className="relative">
                      <input
                        autoComplete="on"
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="Email address"
                        required
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" // Email pattern
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                      >
                        Email Address
                      </label>
                    </div>

                    {/* phone number */}
                    <div className="relative">
                      <input
                        autoComplete="on"
                        id="phone"
                        name="phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="Mobile Number"
                        required
                        inputMode="numeric" // Set input mode to numeric
                        pattern="[0-9]*" // Allow only numeric values
                        minLength="10"
                        maxLength="10"
                      />
                      <label
                        htmlFor="phone"
                        className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                      >
                        Mobile Number
                      </label>
                    </div>
                    {/* password & confirm password */}
                    <div className="relative">
                      <input
                        autoComplete="off"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer placeholder-transparent h-8 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                        placeholder="Password"
                        required
                        minLength="6"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" // Password pattern
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                      >
                        Password
                      </label>
                    </div>
                    {/* confirm password */}
                    <div className="relative">
                      <input
                        autoComplete="off"
                        id="confirm_password"
                        name="confirm_password"
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="peer placeholder-transparent h-8 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                        placeholder="Confirm Password"
                        required
                      />
                      <label
                        htmlFor="confirm_password"
                        className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                      >
                        Confirm Password
                      </label>
                      <span
                        className="absolute right-3 bottom-2 hover:text-black cursor-pointer"
                        onClick={handlePasswordToggle}
                      >
                        {!showPassword && <AiFillEye />}
                        {showPassword && <AiFillEyeInvisible />}
                      </span>
                    </div>
                    {/* address */}
                      {/* <div className="text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs">Address</div> */}
                    <section className="grid grid-cols-2 gap-3 content-center pb-1">
                      {/* address-label */}
                      <div className="relative">
                        <select
                          name="label"
                          value={address.label}
                          onChange={(e) => handleChangeAddress(e)}     
                          id=""
                          className="border-b-2 focus:outline-none focus:border-blue-400 mb-2 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          <option value="" disabled selected
                            className=""
                          >
                            Address Type
                          </option>
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {/* street */}
                      <div className="relative">
                        <input
                          autoComplete="on"
                          id="street"
                          name="street"
                          type="text"
                          value={address.street}
                          onChange={(e) => handleChangeAddress(e)}
                          className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                          placeholder="Street"
                          required
                        />
                        <label
                          htmlFor="street"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          Street
                        </label>
                      </div>
                      {/* city */}
                      <div className="relative">
                        <input
                          autoComplete="on"
                          id="city"
                          name="city"
                          type="text"
                          value={address.city}
                          onChange={(e) => handleChangeAddress(e)}
                          className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                          placeholder="City"
                          required
                        />
                        <label
                          htmlFor="city"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          City
                        </label>
                      </div>
                      {/* state */}
                      <div className="relative">
                        <input
                          autoComplete="on"
                          id="state"
                          name="state"
                          type="text"
                          value={address.state}
                          onChange={(e) => handleChangeAddress(e)}
                          className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                          placeholder="State"
                          required
                        />
                        <label
                          htmlFor="state"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          State
                        </label>
                      </div>
                      {/* country */}
                      <div className="relative">
                        <input
                          autoComplete="on"
                          id="country"
                          name="country"
                          type="text"
                          value={address.country}
                          onChange={(e) => handleChangeAddress(e)}
                          className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                          placeholder="Country"
                          required
                        />
                        <label
                          htmlFor="country"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          Country
                        </label>
                      </div>
                      {/* pincode */}
                      <div className="relative">
                        <input
                          autoComplete="on"
                          id="pincode"
                          name="pincode"
                          type="number"
                          value={address.pincode}
                          onChange={(e) => handleChangeAddress(e)}
                          className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                          placeholder="Pincode"
                          required
                          pattern="[0-9]{6}" // 6 digit pincode
                        />
                        <label
                          htmlFor="pincode"
                          className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                        >
                          Pincode
                        </label>
                      </div>
                    </section>

                    {/* seller checkbox & submit button */}
                    <div className="relative">
                      <Checkbox
                        size="small"
                        onChange={handleCheckbox}
                        inputProps={{
                          "aria-label": "controlled",
                        }}
                      />
                      <span className="text-[12px] text-gray-700 font-[500]">
                        Register as Seller
                      </span>
                    </div>
                    {/* submit button */}
                    <div className="relative flex flex-col">
                      <button className="bg-yellow-300 uppercase text-blue-600 text-[14px] font-[500] rounded-sm px-2 py-1 cursor-pointer hover:bg-yellow-400 hover:shadow-[0px_0px_8px_2px_rgba(212,212,212,0.8)]  transition-all">
                        Continue
                      </button>
                    </div>
                  </div>
                </form>
                <div className="relative mt-4 w-full">
                  <Link to="/login">
                    <button className="bg-white text-primaryBlue w-[90%] font-[600] text-[12px] ml-[5%] px-4 py-2  shadow-[0px_0px_8px_2px_rgba(212,212,212,0.6)] hover:shadow-[0px_0px_8px_2px_rgba(212,212,212,0.8)]  transition-all">
                      Existing User? Log in
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
