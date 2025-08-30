"use client"

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useState } from 'react'

export const FB_PIXEL_ID = "1918175709031268";

declare global {
    interface Window {
        fbq: (...args: any[]) => void;
    }
}

const FacebookPixel = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        if (isLoaded) {
            window.fbq('track', 'PageView')
        }
    }, [pathname, isLoaded])

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                onLoad={() => setIsLoaded(true)}
            >
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${FB_PIXEL_ID}');
                    fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    )
}

export const trackFbEvent = (name: string, options = {}) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', name, options)
  }
}

export default FacebookPixel;
