import { useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { CalendarDays, Eye } from "lucide-react";

import { Button } from "@/components/Button";
import { RESUME_TEMPLATE } from "@/lib/const/resume-template";
import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

const ResumeCard: React.FC<{
  resume: {
    id: number;
    title: string;
    content: string;
    published: number;
    created_at: number;
    updated_at: number;
  };
  index: number;
}> = ({ resume, index }) => {
  const navigate = useNavigate();

  const data: ResumeData = JSON.parse(resume.content);

  const template = RESUME_TEMPLATE[data.config.template];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: (index + 1) * 0.1,
      }}
      className="group relative overflow-hidden rounded-lg border border-custom transition-colors hover:border-primary"
    >
      <div className="aspect-image w-full">
        <img
          className="h-full w-full object-cover transition-all group-hover:brightness-90"
          src={template.img}
          alt={template.name}
        />
      </div>
      {resume.published === 0 && (
        <div className="absolute left-2 top-2 rounded-lg bg-primary px-2 py-1 text-sm text-white">
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
              {dayjs.unix(resume.updated_at).format("YYYY-MM-DD HH:mm")}
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
          >
            删除
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeCard;
