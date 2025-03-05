import React from 'react';

interface ErrorMessageProps {
  message: string;
  show: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, show }) => {
  return (
    <div
      id="message"
      className={`fixed flex justify-center self-center bottom-14 m-2 transform -translate-x-1/2 bg-blue-500 text-black px-4 py-2 rounded-md shadow-md transition-opacity duration-500 z-10 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {show && (
        <p className="align-middle">
          {message}
        </p>
      )}
    </div>
  );
};

export default ErrorMessage;