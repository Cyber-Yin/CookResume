import { useNavigate } from "@remix-run/react";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { motion } from "framer-motion";

import { Button } from "@/components/Button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Index() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="w-full pt-16">
        <div className="relative flex h-[600px] w-full flex-col bg-custom px-6 py-10 sm:h-[calc(80vh-4rem)] sm:min-h-[600px] sm:flex-row sm:py-0">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="h-full w-full bg-gradient-to-t from-blue-200 to-transparent"></div>
          </div>
          <div className="relative z-10 flex basis-1/2 flex-col items-center justify-center pr-0 sm:items-end sm:pr-20">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="flex flex-col items-center space-y-5 sm:items-start"
            >
              <h1 className="relative z-10 text-4xl font-bold sm:text-5xl">
                酷客简历
              </h1>
              <h2 className="relative z-10 text-lg font-semibold text-custom-tertiary sm:text-xl">
                免费、开源、可自托管的在线简历编辑器
              </h2>
              <div className="relative z-10 flex items-end space-x-2">
                <Button onClick={() => navigate("/sign-in")}>快速开始</Button>
                <Button
                  className="bg-black"
                  asChild
                >
                  <a
                    href="https://github.com/Cyber-Yin/CookResume"
                    target="_blank"
                    className="flex cursor-pointer items-center space-x-1"
                  >
                    <img
                      src="/icons/github.svg"
                      className="h-5 w-5"
                    />
                    <div>Github</div>
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex basis-1/2 items-center justify-center sm:justify-start"
          >
            <img
              src="/home/desktop.png"
              alt="desktop"
              className="w-3/4 object-contain sm:h-3/4 sm:w-auto"
            />
          </motion.div>
        </div>
        <CustomDescriptionI />
        <CustomDescriptionII />
        <CustomDescriptionIII />
        <CustomDescriptionIV />
        <CustomDescriptionV />
      </main>
      <Footer />
    </>
  );
}

const CustomDescriptionI: React.FC = () => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center bg-custom-secondary px-6 py-20"
    >
      <motion.div
        animate={{
          opacity: entry?.isIntersecting ? 1 : 0,
        }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold sm:text-3xl"
      >
        为什么选择酷客简历
      </motion.div>

      <div className="mt-20 flex w-full max-w-screen-lg flex-col items-center justify-center space-y-8 sm:flex-row sm:space-x-12 sm:space-y-0">
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : -300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 flex-col items-center space-y-4 sm:items-start"
        >
          <div className="flex items-center space-x-2">
            <img
              src="/icons/edit.svg"
              className="h-8 w-8 sm:h-10 sm:w-10"
              alt=""
            />
            <div className="text-xl font-semibold sm:text-2xl">
              在线表单编辑
            </div>
          </div>
          <div className="text-custom-tertiary sm:text-lg">
            表单编辑，不需要掌握 Markdown 语法，适合初学者快速制作简历
          </div>
        </motion.div>
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : 300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 items-center justify-start"
        >
          <img
            className="max-h-[500px] object-contain"
            src="/home/online-edit.svg"
            alt=""
          />
        </motion.div>
      </div>
    </div>
  );
};

const CustomDescriptionII: React.FC = () => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center bg-custom px-6 py-20"
      style={{
        filter:
          "drop-shadow(0 0px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 0px 2px rgb(0 0 0 / 0.06))",
      }}
    >
      <div className="flex w-full flex-col-reverse items-center justify-center space-y-8 space-y-reverse sm:flex-row sm:space-x-12 sm:space-y-0">
        <div className="relative flex basis-2/3 items-center overflow-hidden py-2">
          <motion.div
            animate={{
              x: [400, 0, 400, 0, 400],
              transition: {
                x: {
                  duration: 8,
                  times: [0, 0.5, 1, 1.5, 2],
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                },
              },
            }}
            className="flex items-center justify-end space-x-4 rounded-lg drop-shadow"
          >
            <img
              className="max-h-[500px] object-contain"
              src="/resume-template/t1.png"
              alt=""
            />
            <img
              className="max-h-[500px] object-contain"
              src="/resume-template/t1.png"
              alt=""
            />
            <img
              className="max-h-[500px] object-contain"
              src="/resume-template/t1.png"
              alt=""
            />
            <img
              className="max-h-[500px] object-contain"
              src="/resume-template/t3.png"
              alt=""
            />
            <img
              className="max-h-[500px] object-contain"
              src="/resume-template/t2.png"
              alt=""
            />
          </motion.div>
          <div className="absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-l from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 top-0 w-10 bg-gradient-to-r from-white to-transparent"></div>
        </div>
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : 300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/3 flex-col items-center space-y-4 sm:items-start"
        >
          <div className="flex items-center space-x-2">
            <img
              src="/icons/theme.svg"
              className="h-8 w-8 sm:h-10 sm:w-10"
              alt=""
            />
            <div className="text-xl font-semibold sm:text-2xl">多种模板</div>
          </div>
          <div className="text-custom-tertiary sm:text-lg">
            多种模板，帮助你制作个性化简历
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CustomDescriptionIII: React.FC = () => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center bg-custom-secondary px-6 py-20"
    >
      <div className="flex w-full max-w-screen-lg flex-col items-center justify-center space-y-8 sm:flex-row sm:space-x-12 sm:space-y-0">
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : -300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 flex-col items-center space-y-4 sm:items-start"
        >
          <div className="flex items-center space-x-2">
            <img
              src="/icons/link.svg"
              className="h-8 w-8 sm:h-10 sm:w-10"
              alt=""
            />
            <div className="text-xl font-semibold sm:text-2xl">
              简历链接预览
            </div>
          </div>
          <div className="text-custom-tertiary sm:text-lg">
            通过访问在线简历链接，直接查看简历内容
          </div>
        </motion.div>
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : 300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 items-center justify-start"
        >
          <img
            className="max-h-[500px] object-contain"
            src="/home/preview.svg"
            alt=""
          />
        </motion.div>
      </div>
    </div>
  );
};

const CustomDescriptionIV: React.FC = () => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center bg-custom px-6 py-20"
      style={{
        filter:
          "drop-shadow(0 0px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 0px 2px rgb(0 0 0 / 0.06))",
      }}
    >
      <div className="flex w-full max-w-screen-lg flex-col-reverse items-center justify-center space-y-8 space-y-reverse sm:flex-row sm:space-x-12 sm:space-y-0">
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : -300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 items-center justify-start"
        >
          <img
            className="max-h-[500px] object-contain"
            src="/home/device.svg"
            alt=""
          />
        </motion.div>

        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            x: entry?.isIntersecting ? 0 : 300,
          }}
          transition={{ duration: 0.5 }}
          className="flex basis-1/2 flex-col items-center space-y-4 sm:items-start"
        >
          <div className="flex items-center space-x-2">
            <img
              src="/icons/mobile.svg"
              className="h-8 w-8 sm:h-10 sm:w-10"
              alt=""
            />
            <div className="text-xl font-semibold sm:text-2xl">响应式布局</div>
          </div>
          <div className="text-custom-tertiary sm:text-lg">
            支持 PC、平板、手机等多种设备，轻松同步编辑
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CustomDescriptionV: React.FC = () => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center bg-custom-secondary px-6 py-20"
    >
      <div className="flex w-full max-w-screen-lg flex-col items-center justify-center space-y-8">
        <motion.div
          animate={{
            opacity: entry?.isIntersecting ? 1 : 0,
            y: entry?.isIntersecting ? 0 : 30,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-xl font-semibold sm:text-2xl">其他特点</div>
        </motion.div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{
              opacity: entry?.isIntersecting ? 1 : 0,
              y: entry?.isIntersecting ? 0 : 30,
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-lg sm:text-xl">
              支持导出 <span className="text-primary-light">PDF</span> 格式简历
            </div>
          </motion.div>
          <motion.div
            animate={{
              opacity: entry?.isIntersecting ? 1 : 0,
              y: entry?.isIntersecting ? 0 : 30,
            }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-lg sm:text-xl">
              可通过 <span className="text-primary-light">Docker</span>{" "}
              镜像自托管部署
            </div>
          </motion.div>
          <motion.div
            animate={{
              opacity: entry?.isIntersecting ? 1 : 0,
              y: entry?.isIntersecting ? 0 : 30,
            }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="text-lg sm:text-xl">开源项目，支持代码审查</div>
          </motion.div>

          <motion.div
            animate={{
              opacity: entry?.isIntersecting ? 1 : 0,
              y: entry?.isIntersecting ? 0 : 30,
            }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="text-lg sm:text-xl">......</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
