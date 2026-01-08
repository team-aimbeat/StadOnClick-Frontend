
const Footer = () => {
    return <div className="dark:text-white-dark ltr:sm:text-left rtl:sm:text-right p-6 pt-0 mt-auto">© {new Date().getFullYear()}. StadonClick All rights reserved.</div>;
};

export default Footer;


// const Footer = () => {
//     return (
//         <footer className="mt-auto">
//             <div className="h-1 bg-[#FFCD00]" />
//             <div className="bg-[#0057B7] text-white">
//                 <div className="px-6 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                     <div>
//                         <div className="text-lg font-semibold tracking-tight">StadonClick</div>
//                         <p className="mt-2 text-sm text-white/80">
//                             Smart city booking and vendor insights with Swedish precision.
//                         </p>
//                     </div>
//                     <div>
//                         <div className="text-xs font-semibold uppercase tracking-widest text-white/70">
//                             Explore
//                         </div>
//                         <div className="mt-3 space-y-2 text-sm">
//                             <a className="block text-white/90 hover:text-white" href="/dashboard">
//                                 Dashboard
//                             </a>
//                             <a className="block text-white/90 hover:text-white" href="/charts">
//                                 Charts
//                             </a>
//                             <a className="block text-white/90 hover:text-white" href="/apps/calendar">
//                                 Calendar
//                             </a>
//                         </div>
//                     </div>
//                     <div>
//                         <div className="text-xs font-semibold uppercase tracking-widest text-white/70">
//                             Support
//                         </div>
//                         <div className="mt-3 space-y-2 text-sm">
//                             <a className="block text-white/90 hover:text-white" href="/apps/mailbox">
//                                 Help Center
//                             </a>
//                             <a className="block text-white/90 hover:text-white" href="/apps/contacts">
//                                 Contact
//                             </a>
//                             <a className="block text-white/90 hover:text-white" href="/apps/notes">
//                                 Release Notes
//                             </a>
//                         </div>
//                     </div>
//                     <div>
//                         <div className="text-xs font-semibold uppercase tracking-widest text-white/70">
//                             Stockholm HQ
//                         </div>
//                         <div className="mt-3 text-sm text-white/85 space-y-1">
//                             <div>Kungsgatan 12</div>
//                             <div>111 35 Stockholm</div>
//                             <div>+46 8 123 456</div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="border-t border-white/15 px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-white/70">
//                     <div>© {new Date().getFullYear()} StadonClick. All rights reserved.</div>
//                     <div className="flex items-center gap-2">
//                         <span className="inline-flex h-2 w-2 rounded-full bg-[#FFCD00]" />
//                         <span>Built with Nordic clarity</span>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// };

// export default Footer;
