'use client'

import { AppInfo } from '@/common/constants'
import { useRouter } from 'next/navigation'

import './page.scss'

/* eslint-disable @next/next/no-img-element */

export default function Home() {
  const router = useRouter()

  return (
    <main className="page-home">
      <header>
        <img src="/icon.svg" alt="Logo" />
        <b>{AppInfo.name}</b>
        &mdash;
        <span>{AppInfo.description}</span>
      </header>
      <section>
        <div className="hero-container">
          <hgroup>
            <h1>
                Unlock customer insights and accelerate product innovation - without a crystal ball
            </h1>
            <h2>
              Transform the way you listen to your users and empower your roadmap with real
              customer-driven insights &mdash; start using <b>{AppInfo.name}</b> today to build
              products your customers love.
            </h2>
          </hgroup>
          <button onClick={() => router.push('/transcripts')}>Get started</button>
          <img src="/crystal-ball.svg" alt="Crystal Ball" />
        </div>
        <hr />
        <p>
          {AppInfo.name} is the AI-powered solution for product teams who want to turn customer
          conversations into actionable feature requests. Effortlessly process chat transcripts,
          extract valuable feedback, and prioritize enhancements that drive user satisfaction
          and business growth.
        </p>
        <hr />
        <ul>
          <li>Instantly analyze support and sales chats to uncover hidden feature requests</li>
          <li>Automate feature request extraction by harnessing the power of AI</li>
          <li>Review, merge, and prioritize feature requests in a streamlined dashboard</li>
        </ul>
      </section>
    </main>
  )
}
