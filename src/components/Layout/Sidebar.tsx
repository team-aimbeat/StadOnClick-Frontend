import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';

import AnimateHeight from 'react-animate-height';

import { useState, useEffect } from 'react';

// React Icons imports from hi2
import { 
  HiChevronDown, 
  HiChevronRight, 
  HiMinus,
  HiHome,
  HiChatBubbleLeftRight,
  HiEnvelope,
  HiClipboardDocumentCheck,
  HiDocumentText,
  HiRectangleStack,
  HiUserGroup,
  HiBanknotes,
  HiCalendar,
  HiCube,
  HiSquares2X2,
  HiChartBar,
  HiCpuChip,
  HiArrowsPointingOut,
  HiTableCells,
  HiChartBarSquare,
  HiDocumentDuplicate,
  HiUser,
  HiDocument,
  HiShieldCheck,
  HiBookOpen,
  HiArrowLeftOnRectangle
} from "react-icons/hi2";

import { IRootState } from '@/app/store';
import { toggleSidebar } from '@/features/Layout/themeConfigSlice';

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Check if sidebar is collapsed based on themeConfig
    const isSidebarCollapsed = !themeConfig.sidebar;

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar    my-4  lg:my-3  
                     fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''} ${
                    isSidebarCollapsed ? 'hidden' : 'block'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                <div className="bg-white dark:bg-black h-full  rounded-2xl">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-27 ml-[50px] flex-none" src="src/assets/logo/logo.png" alt="logo" />
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => {
                                console.log('Toggle sidebar clicked');
                                dispatch(toggleSidebar());
                            }}
                        >
                            <HiChevronDown className="m-auto rotate-90 w-5 h-5" />
                        </button>
                    </div>
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative space-y-0.5 p-4 py-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                    <div className="flex items-center">
                                        <HiHome className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            {t('Dashboard')}
                                        </span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <HiChevronRight className="w-4 h-4" />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                        <li>
                                            <NavLink to="/">{t('sales')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/analytics">{t('analytics')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/finance">{t('finance')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/crypto">{t('crypto')}</NavLink>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <h2
                                className="py-3 px-7 flex items-center uppercase -mx-4 mb-1
                                        bg-gray-100 text-gray-800
                                        dark:bg-gray-200 dark:text-gray-100"
                                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                            >
                                <HiMinus className="w-4 h-5 flex-none hidden" />
                                <span>{t('apps')}</span>
                            </h2>

                            <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <NavLink to="/apps/chat" className="group">
                                            <div className="flex items-center">
                                                <HiChatBubbleLeftRight className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('chat')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/apps/mailbox" className="group">
                                            <div className="flex items-center">
                                                <HiEnvelope className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('mailbox')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/apps/todolist" className="group">
                                            <div className="flex items-center">
                                                <HiClipboardDocumentCheck className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('todo_list')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/apps/notes" className="group">
                                            <div className="flex items-center">
                                                <HiDocumentText className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('notes')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/apps/scrumboard" className="group">
                                            <div className="flex items-center">
                                                <HiRectangleStack className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('scrumboard')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/apps/contacts" className="group">
                                            <div className="flex items-center">
                                                <HiUserGroup className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('contacts')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'invoice' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('invoice')}>
                                            <div className="flex items-center">
                                                <HiBanknotes className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('invoice')}
                                                </span>
                                            </div>

                                            <div className={currentMenu !== 'invoice' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                                <HiChevronRight className="w-4 h-4" />
                                            </div>
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <NavLink to="/apps/calendar" className="group">
                                            <div className="flex items-center">
                                                <HiCalendar className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {t('calendar')}
                                                </span>
                                            </div>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>

                            <h2 className="py-3 px-7 flex items-center uppercase -mx-4 mb-1
                                        bg-gray-100 text-gray-800
                                        dark:bg-gray-200 dark:text-gray-100"
                                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                            >
                                <HiMinus className="w-4 h-5 flex-none hidden" />
                                <span>{t('user_interface')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'component' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('component')}>
                                    <div className="flex items-center">
                                        <HiCube className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            {t('components')}
                                        </span>
                                    </div>

                                    <div className={currentMenu !== 'component' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <HiChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            </li>

                            <li className="menu nav-item">
                                <NavLink to="/charts" className="group">
                                    <div className="flex items-center">
                                        <HiChartBar className="group-hover:!text-primary shrink-0 w-5 h-5" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            {t('charts')}
                                        </span>
                                    </div>
                                </NavLink>
                            </li>


                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;