import { useNavigate, useRevalidator } from "@remix-run/react";
import axios from "axios";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { CalendarDays, Eye, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import { ResumeEntity } from "@/lib/types/resume";
import { cn, formatError } from "@/lib/utils";
import { RESUME_TEMPLATE } from "@/routes/dashboard/const";

const ResumeCard: React.FC<{
  resume: ResumeEntity;
  index: number;
}> = ({ resume, index }) => {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { toast } = useToast();

  const template = useMemo(
    () => RESUME_TEMPLATE.find((item) => item.id === resume.template),
    [resume.template],
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.post(
        "/api/resume/delete",
        {
          resume_id: resume.id,
        },
        {
          withCredentials: true,
        },
      );
      revalidator.revalidate();
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
    <motion.div
      variants={FADE_IN_ANIMATION}
      initial="hidden"
      animate="visible"
      custom={index + 1}
      className="group relative overflow-hidden rounded-lg border border-custom transition-colors hover:border-primary"
    >
      <div className="aspect-image w-full">
        <img
          className="h-full w-full object-cover object-top transition-all group-hover:brightness-90"
          src={template?.img}
          alt={template?.name}
        />
      </div>
      {resume.published === 0 && (
        <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-sm text-white">
          未发布
        </div>
      )}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 translate-y-12 space-y-2 border-t bg-custom px-3 py-2 transition-all group-hover:translate-y-0",
        )}
      >
        <div className="line-clamp-1">{resume.title}</div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4 text-custom-secondary" />
            <div className="text-sm text-custom-secondary">
              {dayjs.unix(resume.updatedAt).format("YYYY-MM-DD HH:mm")}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4 text-custom-secondary" />
            <div className="text-sm text-custom-secondary">{0}</div>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Button
            onClick={() => navigate(`/dashboard/resume/edit/${resume.id}`)}
            className="grow"
          >
            编辑
          </Button>
          <Button
            className="grow"
            variant="destructive"
            onClick={() => setAlertOpen(true)}
          >
            删除
          </Button>
        </div>
      </div>
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除简历？该操作不可恢复
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
    </motion.div>
  );
};

export default ResumeCard;
