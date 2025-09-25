import Product from "./Product";
import Slider from "react-slick";
import { NextBtn, PreviousBtn } from "../Banner/Banner";
import { Link } from "react-router-dom";
import { offerProducts } from "../../../utils/constants";
import { getRandomProducts } from "../../../utils/functions";
import { useEffect, useState } from "react";

// export const settings = {
//     dots: false,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     initialSlide: 0,
//     swipe: false,
//     prevArrow: <PreviousBtn />,
//     nextArrow: <NextBtn />,
//     responsive: [
//         {
//             breakpoint: 1024,
//             settings: {
//                 slidesToShow: 3,
//                 slidesToScroll: 1,
//             },
//         },
//         {
//             breakpoint: 600,
//             settings: {
//                 slidesToShow: 2,
//                 slidesToScroll: 1,
//             },
//         },
//         {
//             breakpoint: 480,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1,
//             },
//         },
//     ],
// };

const DealSlider = ({ title }) => {
    const [slidesToShow, setSlidesToShow] = useState(4);
    
      // Detect screen size manually
      useEffect(() => {
        const handleResize = () => {
          if (window.innerWidth < 480) setSlidesToShow(1);
          else if (window.innerWidth < 768) setSlidesToShow(2);
          else if (window.innerWidth < 1024) setSlidesToShow(3);
          else setSlidesToShow(4);
        };
        handleResize(); // run once
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);
    
      const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow,
        slidesToScroll: 1,
        swipe: true,
        prevArrow: <PreviousBtn />,
        nextArrow: <NextBtn />,
      };
      
    return (
        <section className="bg-white w-full shadow p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
                {/* Left Side */}
                <div className="flex flex-row md:flex-col gap-6 w-[100%] px-6 pt-8 md:w-[20%] justify-between items-center">
                    <h1 className="text-[22px] font-medium">{title}</h1>
                    <Link
                        to="/products"
                        className="bg-primaryBlue text-[12px] sm:text-[16px] font-medium text-gray-400  px-2 sm:px-5 py-1.5 sm:py-2.5 rounded-sm hover:shadow-md"
                    > 
                        VIEW ALL
                    </Link>
                </div>

                {/* Right Side (Slider) */}
                <Slider className="w-full md:w-[80%]" {...settings}>
                    {getRandomProducts(offerProducts, 12).map((item, i) => (
                        <Product {...item} key={i} />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default DealSlider;
