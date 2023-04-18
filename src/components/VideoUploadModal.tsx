import { type ChangeEvent, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/utils/api";
import axios from "axios";
import { useRouter } from "next/router";
const Recorder = dynamic(() => import("~/components/Recorder"), { ssr: false });
import dynamic from "next/dynamic";

export default function VideoUploadModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const getSignedUrl = api.video.getUploadUrl.useMutation();
  const apiUtils = api.useContext();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleSubmit = async (): Promise<void> => {
    if (!file) return;
    setSubmitting(true);
    const { signedUrl, id } = await getSignedUrl.mutateAsync({
      key: file.name,
    });
    await axios
      .put(signedUrl, file.slice(), {
        headers: { "Content-Type": file.type },
      })
      .then(() => {
        void router.push("share/" + id);
      })
      .catch((err) => {
        console.error(err);
      });
    setSubmitting(false);
    void apiUtils.video.getAll.invalidate();
  };

  return (
    <>
      <span
        onClick={openModal}
        className="cursor-pointer rounded border border-[#0000001a] px-2 py-2 text-sm text-[#292d34] hover:bg-[#fafbfc]"
      >
        New video
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => void closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {1 + 1 === 2 ? (
                    <Recorder />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <label className="flex h-32 w-full min-w-[300px] cursor-pointer appearance-none justify-center rounded-md border-2 border-dashed border-gray-300 px-4 transition hover:border-gray-400 focus:outline-none">
                        <span className="flex items-center space-x-2 text-[#292D34]">
                          {file ? (
                            <span className="font-medium">{file.name}</span>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="font-medium">
                                {"Drop files to Attach, or browse"}
                              </span>
                            </>
                          )}
                        </span>
                        <input
                          accept="video/mp4,video/webm"
                          onChange={handleFileChange}
                          type="file"
                          name="file_upload"
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-indigo-400 disabled:cursor-not-allowed"
                        disabled={submitting}
                        onClick={() => void handleSubmit()}
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>Upload</>
                        )}
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
