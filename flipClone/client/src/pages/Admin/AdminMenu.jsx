
import { Link, NavLink, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { GiCrossMark } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth";


const AdminMenu = ({ toggleMenu }) => {
    const { user} = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <section className="flex relative items-start gap-4 p-3 bg-white rounded-sm shadow-md">
                <img
                    src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
                    alt="user svg"
                />

                <div className="flex flex-col justify-center p-1">
                    <div className="text-[14px]">Hello,</div>
                    <div className="font-[600] text-[16px] ">
                        {user?.fname} 
                    </div>
                </div>
                <div
                    className="hover:scale-[1.06] absolute right-4 top-2 cursor-pointer sm:hidden"
                    onClick={toggleMenu}
                >
                    <GiCrossMark />
                </div>
            </section>

            <section className="bg-white flex flex-col justify-center rounded-sm sm:shadow-md overflow-y-auto">
                {/* Account setting */}
                <div className="flex flex-col justify-center border-b-[1px]">
                    <div className="flex flex-row items-center gap-6 pl-[10px] py-[8px]">
                        <PersonIcon className="text-blue-500 text-[16px]" />
                        <div className="font-[600] text-[14px] text-slate-500">
                            ACCOUNT SETTINGS
                        </div>
                    </div>
                    <div className="flex flex-col  text-black font-[300] text-[14px] mb-2 mt-0 ">
                        <NavLink
                            to="/admin/dashboard/profile"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Profile Information
                            </div>
                        </NavLink>

                        <NavLink
                            to="/admin/dashboard/address"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Manage Addresses
                            </div>
                        </NavLink>

                        <NavLink
                            to="/admin/dashboard/pan"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Pan Card
                            </div>
                        </NavLink>
                    </div>
                </div>
                  
                {/* Dashboard */}          
                <div className="flex flex-col justify-center border-b-[1px]">
                    <div className="flex flex-row items-center gap-6 pl-[10px] py-[8px]">
                        <BarChartIcon className="text-blue-500 text-[16px]" />
                        <div className="font-[600] text-[14px] text-slate-500">
                            DASHBOARD
                        </div>
                    </div>
                    <div className="flex flex-col  text-black font-[300] text-[14px] mb-2 mt-0 ">
                        <NavLink
                            to="/admin/orders "
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Orders
                            </div>
                        </NavLink>
                        
                        {/* get all products of seller/admin */}
                        <NavLink
                            to="/admin/dashboard/all-products"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Products
                            </div>
                        </NavLink>
                        {/* crete new product */}
                        <NavLink
                            // to="./add-product"
                            to="/admin/dashboard/add-product"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Add Product
                            </div>
                        </NavLink>
                        
                        {/* Users */}
                        {/* <NavLink
                            to="./users"
                            onClick={scrollToTop}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-[600] text-blue-500 bg-[#f1f3f5]"
                                    : ""
                            }
                        >
                            <div className=" h-[40px] px-[60px] flex items-center hover:text-blue-500 hover:bg-[#f1f3f5]">
                                Users
                            </div>
                        </NavLink> */}
                    </div>
                </div>

                {/* Logout */}          
                <div className="flex flex-col justify-center border-b-[1px]">
                    <div className="flex flex-row items-center gap-6 pl-[10px] py-[8px] group">
                        <PowerSettingsNewIcon className="text-blue-500 text-[16px]" />
                        <button
                            className="font-[600] text-[14px] w-full h-[40px] flex items-center text-slate-500 group-hover:text-blue-500"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Frequently visited */}           
                <div className="flex flex-col items-start gap-2 p-4 bg-white rounded-sm shadow">
                    <span className="text-xs font-medium">
                        Frequently Visited:
                    </span>
                    <div className="flex gap-2.5 text-xs text-gray-500">
                        <Link to="/forgot-password">Change Password</Link>
                        <Link to="/admin/orders">Track Order</Link>
                        <Link to="/">Help Center</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminMenu;
