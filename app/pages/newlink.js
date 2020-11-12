import Link from "next/link";

function newlink() {
    return (
        <div>
        <Link href="/">
            <a>{'\u003C'}{'\u003C'} Go Back </a>
        </Link>
        <p>this is a newlink</p>
        </div>
        )
}

export default newlink;