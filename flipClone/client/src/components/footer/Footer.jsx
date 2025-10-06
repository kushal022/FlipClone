import React from "react";
import logo from "../../assets/images/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: "Facebook",
      icon: (
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
        </svg>
      ),
      url: "#"
    },
    {
      name: "Twitter",
      icon: (
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
        </svg>
      ),
      url: "#"
    },
    {
      name: "Instagram",
      icon: (
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
        </svg>
      ),
      url: "#"
    },
    {
      name: "LinkedIn",
      icon: (
        <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
          <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
          <circle cx="4" cy="4" r="2" stroke="none"></circle>
        </svg>
      ),
      url: "https://www.linkedin.com/in/kushal02"
    }
  ];

  const footerSections = [
    {
      title: "About",
      links: [
        { name: "Company", url: "#" },
        { name: "Careers", url: "#" },
        { name: "Blog", url: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Contact Support", url: "#" },
        { name: "Help Resources", url: "#" },
        { name: "Release Updates", url: "#" }
      ]
    },
    {
      title: "Platform",
      links: [
        { name: "Terms & Privacy", url: "#" },
        { name: "Pricing", url: "#" },
        { name: "FAQ", url: "#" }
      ]
    },
    {
      title: "Contact",
      links: [
        { name: "Send a Message", url: "#" },
        { name: "Request a Quote", url: "#" },
        { name: "1860-200-9898", url: "tel:18602009898" }
      ]
    }
  ];

  return (
    <footer className="w-full text-white bg-[#212121]">
      {/* Main Footer Content */}
      <div className="container flex flex-col flex-wrap px-5 py-16 mx-auto md:items-center lg:items-start md:flex-row md:flex-nowrap">
        {/* Logo and Social Section */}
        <section className="flex-shrink-0 mx-auto text-center md:mx-0 md:text-left">
          <figure className="mb-4">
            <img 
              src={logo} 
              className="w-40 h-auto" 
              alt="Company Logo" 
              loading="lazy"
            />
          </figure>

          {/* Social Media Links */}
          <div className="mt-6">
            <span className="inline-flex justify-center space-x-3 sm:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  aria-label={`Follow us on ${social.name}`}
                  className="text-gray-400 transition-colors duration-200 cursor-pointer hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#212121] rounded"
                  target={social.name === "LinkedIn" ? "_blank" : "_self"}
                  rel={social.name === "LinkedIn" ? "noopener noreferrer" : ""}
                >
                  {social.icon}
                </a>
              ))}
            </span>
          </div>
        </section>

        {/* Footer Links Sections */}
        <section className="md:flex md:flex-wrap md:flex-grow grid grid-cols-2 gap-8 mt-10 -mb-10 text-center md:pl-20 md:mt-0 md:text-left">
          {footerSections.map((section) => (
            <div key={section.title} className="w-full px-4 lg:w-1/4 md:w-1/2">
              <h2 className="mb-4 text-sm font-semibold tracking-widest text-[#878787] uppercase">
                {section.title}
              </h2>
              <nav className="space-y-3">
                {section.links.map((link) => (
                  <div key={link.name} className="mt-2">
                    <a
                      href={link.url}
                      className="text-gray-300 transition-all duration-200 cursor-pointer hover:text-white hover:underline underline-offset-4 focus:outline-none focus:underline"
                    >
                      {link.name}
                    </a>
                  </div>
                ))}
              </nav>
            </div>
          ))}
        </section>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-gray-700">
        <div className="container px-5 py-6 mx-auto">
          <div className="text-center">
            <a 
              href="https://www.linkedin.com/in/kushal02" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#212121] rounded"
            >
              <p className="text-sm text-gray-400 capitalize">
                © {currentYear} All rights reserved • Built with ❤️ by{" "}
                <span className="font-semibold text-gray-300 hover:text-white transition-colors">
                  Kushal Jangid
                </span>
              </p>
            </a>
            
            {/* Additional Info */}
            <p className="mt-2 text-xs text-gray-500">
              Your trusted e-commerce partner
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



// import React from "react";
// import logo from "../../assets/images/logo.png";

// const Footer = () => (
//     <footer className="w-full text-white bg-[#212121]">
//         <main className="container flex flex-col flex-wrap px-5 py-16 mx-auto md:items-center lg:items-start md:flex-row md:flex-no-wrap">
//             <section className="flex-shrink-0 mx-auto text-center md:mx-0 md:text-left">
//                 <figure>
//                     <img src={logo} className="w-40 h-30" alt="logo" />
//                 </figure>

//                 <div className="mt-4 ">
//                     <span className="inline-flex justify-center mt-2 sm:ml-3 sm:mt-0 sm:justify-start">
//                         <a className="text-gray-500 cursor-pointer hover:text-blue">
//                             <svg
//                                 fill="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 className="w-5 h-5"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
//                             </svg>
//                         </a>
//                         <a className="ml-3 text-gray-500 cursor-pointer hover:text-gray-700">
//                             <svg
//                                 fill="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 className="w-5 h-5"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
//                             </svg>
//                         </a>
//                         <a className="ml-3 text-gray-500 cursor-pointer hover:text-gray-700">
//                             <svg
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 className="w-5 h-5"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <rect
//                                     width="20"
//                                     height="20"
//                                     x="2"
//                                     y="2"
//                                     rx="5"
//                                     ry="5"
//                                 ></rect>
//                                 <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
//                             </svg>
//                         </a>
//                         <a className="ml-3 text-gray-500 cursor-pointer hover:text-gray-700">
//                             <svg
//                                 fill="currentColor"
//                                 stroke="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="0"
//                                 className="w-5 h-5"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     stroke="none"
//                                     d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
//                                 ></path>
//                                 <circle
//                                     cx="4"
//                                     cy="4"
//                                     r="2"
//                                     stroke="none"
//                                 ></circle>
//                             </svg>
//                         </a>
//                     </span>
//                 </div>
//             </section>
//             <section className="md:flex md:flex-wrap md:flex-grow grid grid-cols-2 mt-10 -mb-10 text-center md:pl-20 md:mt-0 md:text-left">
//                 <div className="w-full px-4 lg:w-1/4 md:w-1/2">
//                     <h2 className="mb-3 text-sm font-medium tracking-widest text-[#878787] uppercase ">
//                         About
//                     </h2>
//                     <nav className="mb-10 list-none">
//                         <li className="mt-3">
//                             <a className=" cursor-pointer hover:underline underline-offset-4">
//                                 Company
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Careers
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Blog
//                             </a>
//                         </li>
//                     </nav>
//                 </div>
//                 <div className="w-full px-4 lg:w-1/4 md:w-1/2">
//                     <h2 className="mb-3 text-sm font-medium tracking-widest text-[#878787] uppercase ">
//                         Support
//                     </h2>
//                     <nav className="mb-10 list-none ">
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Contact Support
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Help Resources
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Release Updates
//                             </a>
//                         </li>
//                     </nav>
//                 </div>
//                 <div className="w-full px-4 lg:w-1/4 md:w-1/2">
//                     <h2 className="mb-3 text-sm font-medium tracking-widest text-[#878787] uppercase ">
//                         Platform
//                     </h2>
//                     <nav className="mb-10 list-none">
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Terms &amp; Privacy
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Pricing
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 FAQ
//                             </a>
//                         </li>
//                     </nav>
//                 </div>
//                 <div className="w-full px-4 lg:w-1/4 md:w-1/2">
//                     <h2 className="mb-3 text-sm font-medium tracking-widest text-[#878787] uppercase ">
//                         Contact
//                     </h2>
//                     <nav className="mb-10 list-none ">
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Send a Message
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 Request a Quote
//                             </a>
//                         </li>
//                         <li className="mt-3">
//                             <a className="cursor-pointer hover:underline underline-offset-4">
//                                 1860-200-9898
//                             </a>
//                         </li>
//                     </nav>
//                 </div>
//             </section>
//         </main>
//         <main className="container px-5 pb-5 mx-auto text-center">
//             <a href="https://www.linkedin.com/in/kushal02">
//                 <p className="text-md text-gray-600 capitalize xl:text-center">
//                     © {new Date().getFullYear()} All rights reserved - Kushal Jangid
//                 </p>
//             </a>
//         </main>
//     </footer>
// );

// export default Footer;
