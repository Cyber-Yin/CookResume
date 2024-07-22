const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-custom bg-custom px-4 py-8">
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <div className="space-y-4">
          <div>
            <img
              src="/icons/logo.svg"
              alt=""
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold sm:text-xl">酷客简历</div>
            <div className="text-xs text-custom-secondary sm:text-sm">
              免费、开源、可自托管的在线简历编辑器
            </div>
          </div>
          <div className="text-xs sm:text-sm">Licensed Under GPL</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold sm:text-base">项目资源</div>
          <div className="flex flex-col space-y-1">
            <div>
              <a
                href="https://github.com/Cyber-Yin/CookResume"
                target="_blank"
                className="text-xs transition-colors hover:text-primary sm:text-sm"
              >
                Github
              </a>
            </div>

            <div>
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-xs transition-colors hover:text-primary sm:text-sm"
              >
                隐私政策
              </a>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold sm:text-base">技术支持</div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm">support@cookresume.com</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
