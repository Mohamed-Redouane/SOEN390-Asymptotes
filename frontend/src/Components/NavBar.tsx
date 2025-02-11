import logo from '../assets/logo.png';

export default function NavBar() {
    return (
        <nav className="flex items-center pl-6 bg-[#0096d7] h-16 w-full left-0 top-0">
            <ul className="flex justify-around">
                <li className="text-white">
                    <a href="/">
                        <img src={logo} alt="logo" className='h-12' />
                    </a>
                </li>
            </ul>
        </nav>
    );
}