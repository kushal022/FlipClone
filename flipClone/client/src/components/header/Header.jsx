


/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { BiHomeSmile } from "react-icons/bi";
import { LuCircleUserRound } from "react-icons/lu";
import {
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineCiCircle,
} from "react-icons/ai";
import { BsCart2, BsBox } from "react-icons/bs";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdLogin, MdLogout } from "react-icons/md";
import SearchBar from "./SearchBar";
// import { useCart } from "../../context/cart";
// import { toast } from "react-toastify";
// import LogOut from "../../pages/Auth/LogOut";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth";
import { AccountDropdown } from "./AccountDropdown";

const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownMenu = [
        "My Profile",
        "Wishlist",
        "Orders",
    ];

    // toggle Dropdown 
    let closeTimeout;
    const toggleDropdown = () => {
      clearTimeout(closeTimeout)
        setIsDropdownOpen(true)
    }
    const closeDropdown = () => {
      closeTimeout = setTimeout(() => {
        setIsDropdownOpen(false)
      }, 200)
    }

    const handleLogout = () => {
      dispatch(logout())
      console.log('click')
    }


  return (
    <header>
      <nav
        className="h-15 px-4 md:px-[50px] w-full"
      >
        <main className="flex items-center justify-center w-full flex-row ">
          {/* ---------------------primary section [logo + searchbar] */}
          <section className=" flex items-center gap-4 w-full">
              {/* logo */}
              <Link to="/" className="w-60 h-15 flex items-center justify-center">
                <img src={logo} alt="logo" className="size-30 md:size-40 object-cover" />
              </Link>
              <div  className='hidden md:block w-[100%]'><SearchBar /></div>
          </section>

          {/*---------------- secondary section [account + cart ] */}
          <section className="flex items-center gap-[25px] md:gap-[50px] w-[70%] md:w-[30%] ">
            {/* Account */}
            <div
              className={`flex items-center relative cursor-pointer group ${
                user ? "hover:bg-slate-100" : "hover:bg-primaryBlue"
              } rounded-md p-1`}
                onMouseEnter={toggleDropdown}
                onMouseLeave={closeDropdown}
            >
              {user ? (
                <div className="flex items-center gap-1 ">
                  <AiOutlineUser className="text-[22px] " />
                  <span className="text-[18px] max-w-fit hidden md:block lg:block ">
                    <p>{user.name.split(" ")[0] || "user name"}</p>
                  </span>
                  <span>
                    <RiArrowDropDownLine className="group-hover:rotate-[180deg] transition-all " />
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 w-fit">
                  <Link
                    to="/login"
                    className=" flex gap-1 items-center p-2 rounded-lg group-hover:text-white group-hover:bg-blue-500 transition-all"
                  >
                    <AiOutlineUser className="text-[22px] group-hover:text-white" />
                    <span className="text-lg max-w-fit hidden md:block lg:block ">
                      <p>Login</p>
                    </span>
                    <span>
                      <RiArrowDropDownLine className="text-lg size-8 group-hover:rotate-[180deg] transition-all group-hover:text-white" />
                    </span>
                  </Link>
                </div>
              )}

              {/* dropdown menu */}
              {isDropdownOpen && <AccountDropdown user={user} onLogout={handleLogout}/>}
            </div>

            {/* cart */}
            {user?.role !== 'admin' && (
              <div className="flex items-center gap-1 group">
                <NavLink
                  to="/cart"
                  className="relative flex items-center gap-1"
                >
                  <span className="absolute w-4 h-4 text-[11px] text-center font-semibold left-2 bottom-3 text-white bg-red-500 rounded-[50%] ">
                    {/* {cartItems?.length} */}{user?.cart.length || 0}
                  </span>
                  <BsCart2 className="text-[22px]" />
                  <span className="hidden md:block lg:block group-hover:text-slate-700">
                    <p className="text-[18px]">Cart</p>
                  </span>
                </NavLink>
              </div>
            )}
          </section>

        </main>
          <div className="block md:hidden w-full ">
            <SearchBar/>
          </div>
      </nav>
    </header>
  );
};

export default Header;
