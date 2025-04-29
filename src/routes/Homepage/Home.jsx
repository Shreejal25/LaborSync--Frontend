import React, { useState,useRef } from "react";
import { Link } from "react-router-dom";
import logo from '../../assets/images/LaborSynclogo.png'; // Import logo
import efortless from '../../assets/images/efortless.png'
import reporting from '../../assets/images/reporting.png'
import timesheets from '../../assets/images/timesheets.png'
import reward from '../../assets/images/reward.png'
import blogImage1 from '../../assets/images/blogimg1.png'; // Import blog image
import blogImage2 from '../../assets/images/blogimg2.png'; // Import blog image
import { Star } from "lucide-react"; // Import Lucide icons
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
    const [openDropdown, setOpenDropdown] = useState(null); // 'login' or 'register' or null
    const blogSectionRef = useRef(null);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const scrollToBlog = (e) => {
        e.preventDefault();
        blogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-white shadow-md">
            {/* Nav bar Section */}
            <nav className="bg-white shadow-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    {/* Left: Logo */}
                    <img src={logo} alt="LaborSync Logo" className="max-w-[200px] max-h-[60px] object-contain" />
                    
                    {/* Right: Links + Login + Register Dropdown */}
                    <div className="flex items-center space-x-6">
                        {/* Navigation Links */}
                        <a href="#blog" onClick={scrollToBlog} className="text-gray-700 hover:text-blue-600 cursor-pointer">
                            Blogs
                        </a>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600">
                            Solutions
                        </Link>

                        {/* Login Button with Dropdown */}
                        <div className="relative">
                            <button
                                className="bg-blue-500 text-white px-10 py-1 hover:bg-blue-600"
                                onClick={() => toggleDropdown('login')}
                            >
                                Login
                            </button>

                            {/* Login Dropdown */}
                            {openDropdown === 'login' && (
                                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                                    <Link
                                        to="/login"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        onClick={() => setOpenDropdown(null)}
                                    >
                                        Worker
                                    </Link>
                                    <Link
                                        to="/login-manager"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        onClick={() => setOpenDropdown(null)}
                                    >
                                        Manager
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Register Dropdown */}
                        <div className="relative">
                            <button
                                className="bg-orange-400 px-8 py-1  hover:bg-gray-300"
                                onClick={() => toggleDropdown('register')}
                            >
                                Register
                            </button>

                            {/* Register Dropdown Menu */}
                            {openDropdown === 'register' && (
                                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                                    <Link
                                        to="/register"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        onClick={() => setOpenDropdown(null)}
                                    >
                                        Worker
                                    </Link>
                                    <Link
                                        to="/register-manager"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        onClick={() => setOpenDropdown(null)}
                                    >
                                        Manager
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-32 bg-[#F8FAFC]">
                <h1 className="text-3xl md:text-4xl font-bold pb-7">
                    Emphasizing Efficiency and <br />
                    <span className="text-[#A1DBA4]">Simplicity</span>
                </h1>

                <h2 className="text-2xl md:text-base font-semibold text-[#123626] mt-2">
                    "Transform Labor Management Today"
                </h2>
                <p className="text-gray-700 mt-4 md:text-sm">
                    Onboard workers, assign tasks, and manage payroll effortlessly with our smart, intuitive system.
                </p>

                {/* Rating Section */}
                <div className="flex items-center mt-4 space-x-2">
                    {/* Star Icons */}
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={18}
                            className={i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}
                        />
                    ))}

                    {/* Rating Text */}
                    <span className="text-gray-700 text-base font-semibold">4.7</span>
                    <span className="text-gray-500 text-base">(4.8, 9,073 reviews)</span>
                </div>
                <Link to="/login">
                    <button className="mt-6 bg-gray-500 text-white px-6 py-2 rounded-full text-lg hover:bg-blue-600">
                        
                        Get Started
                    </button>
                </Link>
            </section>

            {/* Feature Section */}
            <section className="py-16 bg-[#d3d4d4]">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center space-x-8">
                        {/* Feature 1 */}
                        <div className="w-1/4 text-center">
                            <img src={efortless} alt="Effortless Time Tracking" className="w-[66px] h-auto mx-auto" />
                            <h2 className="text-lg font-bold text-gray-800 mt-4">
                                Effortless Time Tracking
                            </h2>
                        </div>

                        {/* Feature 2 */}
                        <div className="w-1/4 text-center">
                            <img src={reporting} alt="Reporting and Analytics" className="w-[66px] h-auto mx-auto" />
                            <h2 className="text-lg font-bold text-gray-800 mt-4">
                                Reporting and Analytics
                            </h2>
                        </div>

                        {/* Feature 3 */}
                        <div className="w-1/4 text-center">
                            <img src={timesheets} alt="Time Sheets" className="w-[66px] h-auto mx-auto" />
                            <h2 className="text-lg font-bold text-gray-800 mt-4">
                                Time Sheets
                            </h2>
                        </div>

                        {/* Feature 4 */}
                        <div className="w-1/4 text-center">
                            <img src={reward} alt="Reward based on performance" className="w-[66px] h-auto mx-auto" />
                            <h2 className="text-lg font-bold text-gray-800 mt-4">
                                Reward based on performance
                            </h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section  ref={blogSectionRef} className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">LaborSync  <span className="text-[#A1DBA4]">Usage</span></h2>
                    <div className="flex items-center justify-between mt-8">
                        {/* Left: Blog Image */}
                        <div className="w-1/2  ">
                        <img src={blogImage1} alt="Blog" className="w-full h-auto object-cover  my-14" style={{ maxHeight: '300px' }} />
                        </div>

                        {/* Right: Blog Text */}
                        <div className="w-1/2 pl-11">
                            <h3 className="text-2xl font-bold text-gray-800 mb-8">"What are the key benefits and features of using Labor Sync for time and attendance tracking?"</h3>
                            <p className="text-gray-700 mb-24 text-justify text-base">
                            Labor Sync is an efficient time and attendance tracking system designed to streamline workforce management for businesses of all sizes. By leveraging cutting-edge technology, Labor Sync allows employers to monitor employee hours in real-time, providing accurate and reliable data for payroll processing. The system is accessible via mobile devices, enabling employees to clock in and out from remote locations, thereby promoting flexibility and reducing administrative overhead. Additionally, Labor Sync offers robust reporting features that help managers analyze labor costs, identify trends, and make informed decisions to optimize workforce productivity. The platform's user-friendly interface ensures seamless integration with existing business processes, making it an invaluable tool for improving operational efficiency and compliance with labor regulations.
                            </p>
                            
                        </div>
                    </div>
                </div>


                <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Streamlining Labor Management <span className="text-[#A1DBA4]">System</span></h2>
            <div className="flex items-center justify-between mt-4">

                    {/* Right: Blog Text (Now on the left) */}
                    <div className="w-1/2 pr-11 my-14"> {/* Note: Changed pl-11 to pr-11 */}
                        <h3 className="text-2xl font-bold text-gray-800 mb-8">"What are the key components and benefits of a streamlined labor management system?"
                        </h3>
                        <p className="text-gray-700 mb-24 text-justify text-base">
                        Streamlining a labor management system involves optimizing and automating various processes arelated to workforce management to enhance efficiency, accuracy, and productivity. This can include implementing automated time and attendance tracking, real-time data access, integrated scheduling, payroll integration, compliance management, employee self-service portals, robust analytics and reporting, mobile accessibility, cost reduction, and enhanced communication. By leveraging advanced technologies, businesses can ensure accurate tracking of employee hours, reduce administrative overhead, comply with labor laws, and ultimately improve operational performance and employee satisfaction.
                        </p>
                    </div>

                    {/* Left: Blog Image (Now on the right) */}
                    <div className="w-1/2 flex justify-center items-center"> {/* Added flex for centering */}
                        <img src={blogImage2} alt="Blog" className="w-[480px] h-[300px] object-cover my-14" style={{ maxHeight: '400px' }} />
                    </div>
                </div>
            </div>
        </section>

        <footer className="bg-blue-100 text-gray-700 text-sm py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div>
          <h3 className="font-semibold">Social Media</h3>
          <div className="flex space-x-3 mt-2">
            <a href="#" className="text-blue-500"><i className="fab fa-facebook"></i></a>
            <a href="#" className="text-blue-400"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-blue-600"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="text-green-500"><i className="fab fa-whatsapp"></i></a>
          </div>
          <p className="mt-2">Stay connected with us</p>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="font-semibold">Company</h3>
          <p className="mt-2">About Us</p>
          <p className="mt-2">Our Services</p>
          <p className="mt-2">Careers</p>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="font-semibold">Support</h3>
          <p className="mt-2">FAQs</p>
          <p className="mt-2">Help Center</p>
          <p className="mt-2">Privacy Policy</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center space-x-2">
          <i className="fas fa-map-marker-alt text-orange-500"></i>
          <p>123 Business Street, City, Country</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone-alt text-orange-500"></i>
            <p>+1 234-567-8900</p>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope text-orange-500"></i>
            <p>support@company.com</p>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-clock text-orange-500"></i>
            <p>Monday - Friday: 9 AM - 6 PM</p>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center mt-6 text-xs">
        © 2025 LaborSync. All rights reserved.
      </div>
    </footer>
 
    </div>
    );
};

export default Home;