import { useNavigate, useOutletContext } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/AlertDialog";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toaster/hooks";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { UserEntity } from "@/lib/types/user";
import { formatError } from "@/lib/utils";

import AvatarSetting from "./components/AvatarSetting";
import EmailSetting from "./components/EmailSetting";
import UsernameSetting from "./components/UsernameSetting";

export default function DashboardAccountPage() {
  const { user } = useOutletContext<{
    user: UserEntity;
  }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.post("/api/account/delete", undefined, {
        withCredentials: true,
      });
      navigate("/");
    } catch (e) {
      toast({
        title: "删除失败",
        variant: "destructive",
        description: formatError(e),
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="pt-16">
      <div className="mx-auto w-full max-w-screen-lg space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">账号设置</h1>
        <div className="space-y-4">
          <AvatarSetting
            index={0}
            avatar={user.avatar}
            userName={user.name}
          />
          <UsernameSetting
            index={1}
            userName={user.name}
          />
          <EmailSetting
            index={2}
            email={user.email}
          />
          <motion.div
            variants={FADE_IN_ANIMATION}
            custom={3}
            initial="hidden"
            animate="visible"
            className="flex w-full justify-end"
          >
            <Button
              onClick={() => setAlertOpen(true)}
              variant="destructive"
            >
              删除账号
            </Button>
          </motion.div>
        </div>
      </div>
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除账号？该操作不可恢复
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setAlertOpen(false)}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "确定"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
