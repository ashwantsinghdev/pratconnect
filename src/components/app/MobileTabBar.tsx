import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";


const tabs = [
  {
    icon: "ri-home-5-line",
    activeIcon: "ri-home-5-fill",
    href: "/app/dashboard",
    label: "Home",
  },
  {
    icon: "ri-chat-smile-3-line",
    activeIcon: "ri-chat-smile-3-fill",
    href: "/app/my-posts",
    label: "Posts",
  },
  {
    icon: "ri-group-line",
    activeIcon: "ri-group-fill",
    href: "/app/friends",
    label: "Friends",
  },
];

const MobileTabBar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20000 w-full
                 bg-card border-t border-border
                 flex items-center justify-around
                 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            to={tab.href}
            aria-label={tab.label}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <i
              className={isActive ? tab.activeIcon : tab.icon}
              style={{ fontSize: 20 }}
            ></i>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
