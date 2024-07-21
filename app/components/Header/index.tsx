import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { LogOut, NotepadText, User } from "lucide-react";

import { UserEntity } from "@/lib/types/user";
import { formatError } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { Button } from "../Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../Sheet";
import { useToast } from "../Toaster/hooks";
import { VisuallyHidden } from "../VisuallyHidden";

const Header: React.FC<{
  user?: UserEntity;
}> = ({ user }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await axios.post("/api/account/logout");
      navigate("/sign-in");
    } catch (e) {
      toast({
        title: "退出登录失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <header className="fixed z-20 flex h-16 w-full items-center justify-between bg-custom px-4 drop-shadow">
        <div
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center space-x-2"
        >
          <img
            className="h-9 w-9 sm:h-11 sm:w-11"
            src="/icons/logo.svg"
            alt="logo"
          />
          <div className="text-xl font-semibold sm:text-2xl">酷客简历</div>
        </div>

        {user ? (
          <Sheet>
            <SheetTrigger asChild>
              <Avatar className="h-9 w-9 hover:cursor-pointer sm:h-11 sm:w-11">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback>
                  {user.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </SheetTrigger>
            <SheetContent>
              <VisuallyHidden asChild>
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                  <SheetDescription></SheetDescription>
                </SheetHeader>
              </VisuallyHidden>
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback>
                    {user.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-custom">{user.name}</div>
              </div>
              <hr className="my-4 border-t-[1.5px] border-custom" />
              <div className="space-y-1 text-custom">
                <div
                  onClick={() => navigate("/dashboard/account")}
                  className="flex cursor-pointer items-center space-x-2 rounded-md px-4 py-1.5 transition-colors hover:bg-custom-hover"
                >
                  <User className="h-4 w-4" />
                  <div className="text-sm">个人信息</div>
                </div>
                <div
                  onClick={() => navigate("/dashboard")}
                  className="flex cursor-pointer items-center space-x-2 rounded-md px-4 py-1.5 transition-colors hover:bg-custom-hover"
                >
                  <NotepadText className="h-4 w-4" />
                  <div className="text-sm">我的简历</div>
                </div>
              </div>
              <hr className="my-4 border-t-[1.5px] border-custom" />
              <div className="space-y-1 text-custom">
                <div
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center space-x-2 rounded-md px-4 py-1.5 transition-colors hover:bg-custom-hover"
                >
                  <LogOut className="h-4 w-4" />
                  <div className="text-sm">退出登录</div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button onClick={() => navigate("/sign-in")}>登录</Button>
        )}
      </header>
    </>
  );
};

export default Header;
