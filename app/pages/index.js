import Link from "next/link";

function Index() {
    return (
    <div>
    <Link href="/newlink">
        <a>newlink</a>
    </Link>
    <p>this is a tor onion v3 site ran on next.js</p>
    </div>
    )
}

export default Index;