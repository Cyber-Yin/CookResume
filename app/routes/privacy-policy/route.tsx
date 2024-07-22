import { MetaFunction } from "@remix-run/node";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const meta: MetaFunction = () => {
  return [{ title: "隐私政策 - 酷客简历" }];
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="w-full bg-custom pt-16">
        <div className="mx-auto w-full max-w-screen-lg space-y-10 px-6 py-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">隐私政策</h1>
            <div className="text-xs text-custom-secondary sm:text-sm">
              上次编辑时间：2024-07-22
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">1.简介</div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                本隐私政策概述了我们如何收集、使用和保护您在使用我们的网络应用程序时提供的个人信息。若您继续使用酷客简历，将视为您同意本协议的以下条款：
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">
                2.信息收集和使用
              </div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                为了在使用我们的服务时获得更好的体验，我们可能会要求您向我们提供某些个人身份信息，包括但不限于您的姓名和电子邮件地址。我们收集的信息将用于联系或识别您的身份，主要用于以下目的：
              </p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>帐户创建：允许您创建和管理您的帐户。</li>
                <li>
                  功能使用：启用您选择使用的应用程序的各种功能，例如构建和保存简历。
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">
                3.我们如何收集信息
              </div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                所有个人数据均由您直接提供。当您在使用我们的服务时自愿向我们提供信息时，我们会通过我们的网络应用程序收集信息。
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">4.数据安全</div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                酷客简历致力于确保您的数据安全。我们的应用程序和数据库托管在腾讯云的安全服务器上，该服务器符合
                SOC 2 和 SOC 3 标准，确保您的数据受到行业标准安全措施的保护。
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">5.数据保留</div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                只要您的帐户处于活动状态或根据需要为您提供服务，我们就会保留您的个人数据。您可以随时通过用户仪表板删除您的数据。
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">
                6.第三方披露
              </div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                我们不会与第三方分享您的个人信息，确保您的数据仅用于本隐私政策中规定的目的。
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">
                7.隐私政策的变更
              </div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                我们可能会不定时更新我们的隐私政策。如有任何更改，我们将通过在此页面上发布新的隐私政策来通知您。建议您定期查看本隐私政策以了解详情。
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold sm:text-xl">8.联系我们</div>
              <p className="text-justify text-sm/6 sm:text-base/7">
                如果您对我们的隐私政策有任何疑问或建议，请随时通过
                support@cookresume.com 与我们联系。
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
