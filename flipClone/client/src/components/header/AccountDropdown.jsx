import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
import { BsCart2, BsBox } from "react-icons/bs";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdLogin, MdLogout } from "react-icons/md";
import SearchBar from "./SearchBar";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth";

export const AccountDropdown = ({ user, onLogout }) => {
  const menuItems = [
    {
      label: "My Profile",
      to: `${user?.role === "admin" ? "/admin" : "/user"}/dashboard`,
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    ...(user?.role !== "admin"
      ? [
          {
            label: "Wishlist",
            to: "/user/wishlist",
            icon: <AiOutlineHeart className="text-[14px]" />,
          },
        ]
      : []),
    {
      label: "Orders",
      to: `${user?.role === "admin" ? "/admin" : "/user"}/orders`,
      icon: <BsBox className="text-[14px]" />,
    },
    ...(user
      ? [
          {
            label: "Logout",
            to: "/login",
            icon: <MdLogout className="text-[14px]" />,
            onClick: onLogout,
          },
        ]
      : [
          {
            label: "Sign up",
            to: "/register",
            icon: <MdLogin className="text-[14px]" />,
          },
        ]),
  ];

  return (
    <div className="absolute top-[60px] -left-[2px] z-50 bg-white border border-gray-300 rounded-md p-2 w-[140px] shadow-md">
      <ul>
        {menuItems.map(({ label, to, icon, onClick }) => (
          <li
            key={label}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Link to={to} onClick={onClick} className="flex items-center gap-3">
              {icon}
              <span className="text-[16px]">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="border-b">
      <nav className="container px-4 md:px-[50px]">
        <main className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-14 w-full">
          {/* Logo + Search */}
          <section className="flex items-center justify-between w-full max-w-[650px] gap-4">
            <Link to="/">
              <img src={logo} alt="logo" className="w-35 lg:w-50" />
            </Link>
            <div className="flex-1 order-2 md:order-none">
              <SearchBar />
            </div>
          </section>

          {/* Account + Cart */}
          <section className="flex items-center gap-6 md:gap-[50px] w-full md:w-auto">
            {/* Account */}
            <div
              className={`flex items-center relative cursor-pointer group ${
                user ? "hover:bg-slate-100" : "hover:bg-primaryBlue"
              } rounded-md p-1`}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {user ? (
                <div className="flex items-center gap-1">
                  <AiOutlineUser className="text-[22px]" />
                  <span className="text-[18px] hidden md:block">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <RiArrowDropDownLine className="group-hover:rotate-180 transition-transform" />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 p-2 rounded-lg group-hover:text-white group-hover:bg-blue-500 transition-all"
                >
                  <AiOutlineUser className="text-[22px] group-hover:text-white" />
                  <span className="hidden md:block">Login</span>
                  <RiArrowDropDownLine className="size-8 group-hover:rotate-180 transition-transform group-hover:text-white" />
                </Link>
              )}

              {isDropdownOpen && (
                <AccountDropdown user={user} onLogout={handleLogout} />
              )}
            </div>

            {/* Cart */}
            {user?.role !== "admin" && (
              <NavLink to="/cart" className="relative flex items-center gap-1">
                <span className="absolute w-4 h-4 text-[11px] text-center font-semibold left-2 bottom-3 text-white bg-red-500 rounded-full">
                  {user?.cart?.length || 0}
                </span>
                <BsCart2 className="text-[22px]" />
                <span className="hidden md:block group-hover:text-slate-700">
                  Cart
                </span>
              </NavLink>
            )}
          </section>
        </main>
      </nav>
    </header>
  );
};



//  {isDropdownOpen && (
//                 <div
//                   className="absolute top-[60px] -left-[2px] z-50 bg-white border border-gray-300 rounded-md p-2 w-[140px] transition-all flex flex-col "
//                 >
//                   <ul>
//                     {!user && (
//                       <li className="p-1 hover:bg-slate-100 rounded-md">
//                         <Link
//                           to="/register"
//                           className="flex items-center gap-3"
//                         >
//                           <MdLogin className="text-[14px]" />
//                           <span className="text-[16px]">Sign up</span>
//                         </Link>
//                       </li>
//                     )}

//                     <li className="p-1 hover:bg-slate-100 rounded-md">
//                       <Link
//                         to={`${user?.role === 'admin' ? "/admin" : "/user"}/dashboard`}
//                         className="flex items-center gap-3"
//                       >
//                         <AiOutlineUser className="text-[14px]" />
//                         <span className="text-[16px]">My Profile</span>
//                       </Link>
//                     </li>

//                     {/* if user is not admin */}
//                     {user?.role !== 'admin' && (
//                       <li className="p-1 hover:bg-slate-100 rounded-md">
//                         <Link 
//                           to="/user/wishlist"
//                           className="flex items-center gap-3"
//                         >
//                           <AiOutlineHeart className="text-[14px]" />
//                           <span className="text-[16px]">Wishlist</span>
//                         </Link>
//                       </li>
//                     )}

//                     <li className="p-1 hover:bg-slate-100 rounded-md">
//                       <Link
//                         to={`${user?.role === 'admin' ? "/admin" : "/user"}/orders`}
//                         className="flex items-center gap-3"
//                       >
//                         <BsBox className="text-[14px]" />
//                         <span className="text-[16px]">Orders</span>
//                       </Link>
//                     </li>

//                     {user && (
//                       <li className="p-1 hover:bg-slate-100 rounded-md ">
//                         <Link
//                           onClick={handleLogout}
//                           to="/login"
//                           className="flex items-center gap-3"
//                         >
//                           <MdLogout className="text-[14px]" />
//                           <span className="text-[16px]">Logout</span>
//                         </Link>
//                       </li>
//                     )}
//                   </ul>
//                 </div>
//               )}
