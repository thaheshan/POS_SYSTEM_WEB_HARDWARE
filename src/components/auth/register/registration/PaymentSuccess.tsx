'use client';
import ProgressBar from "@/components/staff-register/ProgressBar";
import { ShopPaymentDetails } from "@/utils/ShopPaymentDetails";
import { Check, GiftIcon, Mail } from "lucide-react";
import React from "react";

const PaymentSuccess = () => {
  const data = ShopPaymentDetails
  return (
    <div className="w-full flex flex-col items-center ">
      <div className="w-full flex flex-col mb-14">
        <ProgressBar currentStep={4} totalSteps={6} />
      </div>

      {/* Success Hero section */}
      <div
        className="w-full flex md:max-w-7xl h-auto flex-col items-center text-center  py-12 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/images/register/Success_Background.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Success Icon space */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-[90px] h-[90px] bg-gradient-to-bl from-[#046C4E] to-[#0E9F6E] rounded-full shadow-md shadow-green-500/20 mb-2">
            <Check className="w-10 h-10 text-white stroke-[3.75px]" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-[#0E9F6E]">
            Payment Successful!
          </h1>
          <p className="text-slate-500 mt-2 text-sm lg:text-base">
            Welcome to Futura Hardware!
          </p>
        </div>
        <div className="w-full  max-w-[300px] md:max-w-[400px] bg-white border-[1.8px] border-[#09eca0] rounded-xl p-5 shadow-md mt-10">
          <div className="flex gap-3 items-center justify-center">
            <GiftIcon className="text-[#046C4E] size-6 md:size-8" />
            <span className="text-black text-[15px] md:text-lg font-bold text-left">
              Your 30-day Trial Starts Now
            </span>
          </div>
          <table className="w-full ">
            <tbody>
              <tr className="flex flex-row justify-between">
                <td className=" flex py-3 px-4 text-sm text-slate-600 text-left">Plan</td>
                <td className=" flex py-3 px-4 text-sm text-slate-900 font-medium text-right">
                  {data.planName}
                </td>
              </tr>
              <tr className="flex flex-row justify-between border-b border-slate-200">
                <td className=" flex py-3 px-4 text-sm text-slate-600 text-left">
                  Trial Ends
                </td>
                <td className=" flex py-3 px-4 text-sm text-slate-900 font-medium text-right">
                  {data.trialEndDate}
                </td>
              </tr>
              <tr className="flex flex-row justify-between ">
                <td className=" flex py-3 px-4 text-sm text-slate-600 text-left ">
                  First Payment
                </td>
                <td className=" flex py-3 px-4 text-sm text-slate-900 font-medium text-right">
                  {data.currency} {data.price} {data.nextPaymentDate}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Information */}
      <div className="w-full max-w-[300px] md:max-w-[500px] text-left mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Account Information</h2>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-slate-600">
            Shop ID: <span className="font-semibold text-slate-900 ml-2">{data.shopId}</span>
          </p>
          <p className="text-sm text-slate-600">
            Email: <span className="font-semibold text-slate-900 ml-4">{data.userEmail}</span>
          </p>
        </div>
        <hr className="mt-4 border-slate-200 py-1" />
        <div className="flex items-center gap-2 text-[#1A56DB]">
          <Mail className="w-4 h-4" />
          <span className="text-sm font-medium">Confirmation email sent to your inbox</span>
        </div>
        
      </div>

      {/* What's Next */}
      <div className="w-full max-w-[300px] md:max-w-[500px] text-left mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5">What&apos;s Next?</h2>
        <div className="space-y-4">
          {[
            "Set up your shop profile and inventory",
            "Import existing products or add new items",
            "Start managing sales and tracking inventory",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A56DB] text-white text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      <div className="w-full max-w-[300px] md:max-w-[500px] mb-4">
        <button className="w-full py-2.5 bg-[#1A56DB] hover:bg-[#1648c0] text-white font-semibold rounded-full transition-colors"
        onClick={() => window.location.href = '/dashboard'}>
          Complete
        </button>
      </div>

      {/* Contact Support */}
      <div className="flex flex-col items-center gap-1 mb-10">
        <span className="text-sm text-slate-500">Need help?</span>
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#1A56DB] hover:underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
