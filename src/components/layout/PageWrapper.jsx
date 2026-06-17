import Sidebar from './Sidebar';
import TeacherSidebar from './TeacherSidebar';
import VerifyBanner from './VerifyBanner';

export default function PageWrapper({ children, role = 'student' }) {
  const SidebarComp = role === 'teacher' ? TeacherSidebar : Sidebar;
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <SidebarComp />
      <main className="flex-1 md:ml-[260px] min-h-screen dot-grid">
        <VerifyBanner />
        <div className="max-w-[1280px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
