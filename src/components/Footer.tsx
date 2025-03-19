import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-2 mt-auto">
      <div className="container mx-auto flex justify-between items-center">
        <p>&copy; 2024</p>
        <Image
          src="/atomaccelerator.png"
          alt="Atom Accelerator Logo"
          width={100}
          height={50}
        />
        <Image
          src="/neutron.png"
          alt="Neutron Logo"
          width={100}
          height={50}
        />
        <Image
          src="/drpc.png"
          alt="Powered by dRPC"
          width={50}
          height={20}
          className="rounded-full"
        />
        <a href="https://github.com/armsves/IBCLendingHub" target="_blank" rel="noopener noreferrer">
          <Image
            src="/github.png"
            alt="Github Logo"
            width={50}
            height={20}
            className="rounded-full"
          />
        </a>
        <a href="https://x.com/armsves" target="_blank" rel="noopener noreferrer">
          <Image
            src="/twitterx.png"
            alt="Twitter Logo"
            width={50}
            height={20}
            className="rounded-full"
          />
        </a>
        <Image
          src="/web3fam.png"
          alt="Web3Family Logo"
          width={50}
          height={20}
          className="rounded-full"
        />
        <Image
          src="/AKASHA-Hub.png"
          alt="AKASHA-Hub Logo"
          width={100}
          height={50}
        />
      </div>
    </footer>
  );
};

export default Footer;