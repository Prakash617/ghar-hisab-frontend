import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          RoomManager
        </Link>
        <div className="flex gap-4">
          <Link href="#features" className="hover:text-gray-300">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-gray-300">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-gray-300">
            Login
          </Link>
          <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
