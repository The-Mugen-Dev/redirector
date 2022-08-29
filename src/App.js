import './App.css';
import {useEffect, useState} from "react";

function App() {

    const [shortLinks, setShortLinks] = useState([]);
    const [longUrl, setLongUrl] = useState([]);
    const [isMounted, setIsMounted] = useState(false)

    useEffect( () => {
        if(!isMounted){
            window.cookieStore.get("redirector_short_links").then(shortLinksCookie => {
                const savedLinks = shortLinksCookie ? JSON.parse(shortLinksCookie.value) : [];
                if (savedLinks.length > 0) {
                    setShortLinks(savedLinks);
                }
            });
            setIsMounted(true)
        }
        else{
            document.cookie = `redirector_short_links=${JSON.stringify(shortLinks)};max-age=31536000;`
        }
    }, [isMounted,shortLinks])

    function sendLinkShortenerRequest(e) {
        e.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: longUrl})
        };

        fetch("https://redirector.themugendev.com/links", requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    setShortLinks([...shortLinks, {
                        shortUrlId: result.id,
                        longUrl: result.url
                    }]);
                },
                (error) => {
                    //TODO: Add error handling
                    console.log(error)
                }
            )
    }

    const ShortLinksItems = () => {
        const redirectBase = 'https://redirector.themugendev.com/';
        const linkItems = () => shortLinks.map((link, key) => <li key={key}><span>{link.longUrl}</span> <a
            href={`${redirectBase}${link.shortUrlId}`}>{`${redirectBase}${link.shortUrlId}`}</a></li>);
        return <ul>{linkItems()}</ul>
    }

    return (
        <div className="App">
            <form>
                <label>
                    <input type="text" name="url" value={longUrl} onChange={e => setLongUrl(e.target.value)}
                           placeholder="Shorten your link"/>
                </label>
                <input type="submit" value="From" onClick={sendLinkShortenerRequest}/>
            </form>

            {shortLinks &&
                ShortLinksItems()
            }
        </div>
    );
}

export default App;
