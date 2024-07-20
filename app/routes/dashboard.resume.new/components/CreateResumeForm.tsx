import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import { useToast } from "@/components/Toaster/hooks";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { cn, formatError } from "@/lib/utils";
import { RESUME_TEMPLATE } from "@/routes/dashboard/const";

const CreateResumeForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    title: "",
    template: 0,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const { title, template } = formState;

      if (!title) {
        throw new Error("请输入简历标题");
      }

      if (template < 0 || template >= RESUME_TEMPLATE.length) {
        throw new Error("请选择简历模板");
      }

      setSubmitLoading(true);

      const { data: ResumeCreateResponse } = await axios.post<{
        data: {
          id: number;
        };
      }>(
        "/api/resume/new",
        {
          title,
          template,
        },
        {
          withCredentials: true,
        },
      );

      navigate(`/dashboard/resume/edit/${ResumeCreateResponse.data.id}`);
    } catch (e) {
      toast({
        title: "创建简历失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <h2 className="text-center text-2xl font-semibold">
        请输入简历标题并选择模板
      </h2>
      <FormInput
        label="简历标题"
        value={formState.title}
        onValueChange={(value) => {
          setFormState({ ...formState, title: value });
        }}
      />
      <div className="space-y-1.5">
        <Label>模板</Label>
        <div className="grid w-full grid-cols-3 gap-4">
          {RESUME_TEMPLATE.map((item, index) => (
            <motion.div
              variants={FADE_IN_ANIMATION}
              initial="hidden"
              animate="visible"
              custom={index}
              onClick={() => {
                setFormState({ ...formState, template: item.id });
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-md border-2 border-custom transition-colors hover:border-primary",
                {
                  "border-primary": formState.template === item.id,
                },
              )}
              key={item.id}
            >
              <img
                className={cn(
                  "h-full w-full object-cover object-top transition-all group-hover:brightness-90",
                  {
                    "brightness-90": formState.template === item.id,
                  },
                )}
                src={item.img}
                alt={item.name}
              />
              {formState.template === item.id && (
                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-1">
                  <Check className="h-full w-full text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <Button
          variant="destructive"
          disabled={submitLoading}
          onClick={() => navigate(-1)}
        >
          取消
        </Button>
        <Button
          disabled={submitLoading}
          onClick={handleSubmit}
        >
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "创建"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateResumeForm;
