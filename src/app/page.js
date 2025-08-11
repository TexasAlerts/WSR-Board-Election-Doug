diff --git a/src/app/page.js b/src/app/page.js
index 35bb703836f1511d2a4305ef5fbf774dcb1e25f7..ba2db61a0cae48aeb412862e02956de174cb5a68 100644
--- a/src/app/page.js
+++ b/src/app/page.js
@@ -1,48 +1,51 @@
 "use client";
 
 import { useState, useEffect, Suspense } from 'react';
 import Image from 'next/image';
 import Link from 'next/link';
 import { useSearchParams } from 'next/navigation';
 import EndorsementsCarousel from '../components/EndorsementsCarousel';
 import {
   Music,
   AudioWaveform,
   Waves,
   Cross,
   Shield,
   PlaneLanding,
   Eye,
   MapPinned,
   Mountain,
   MountainSnow,
   Navigation,
   Building2,
   Home as HomeIcon,
   Compass,
   Link as LinkIcon,
+  Megaphone,
+  Users,
+  PiggyBank,
 } from 'lucide-react';
 
 function HomeContent() {
   // Q&A list and endorsements fetched from backend
   const [questions, setQuestions] = useState([]);
   const [endorsements, setEndorsements] = useState([]);
   // Form state for question submission
   const [qForm, setQForm] = useState({ name: '', email: '', question: '' });
   const [qThanks, setQThanks] = useState(false);
   // Form state for get involved / endorsement
   const [mode, setMode] = useState('involved');
   const [formType, setFormType] = useState('updates');
   const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
   const [submitMsg, setSubmitMsg] = useState('');
 
   useEffect(() => {
     // Load approved questions and endorsements
     async function loadData() {
       try {
         const qRes = await fetch('/api/questions', { cache: 'no-store' });
         const qData = await qRes.json();
         setQuestions(Array.isArray(qData.data) ? qData.data : []);
       } catch (err) {
         console.error('Error loading questions', err);
       }
diff --git a/src/app/page.js b/src/app/page.js
index 35bb703836f1511d2a4305ef5fbf774dcb1e25f7..ba2db61a0cae48aeb412862e02956de174cb5a68 100644
--- a/src/app/page.js
+++ b/src/app/page.js
@@ -163,67 +166,71 @@ function HomeContent() {
         />
         <h1 className="text-4xl sm:text-5xl font-extrabold text-lagoon">Your Voice. Your Vote. Our Windsong.</h1>
         <p className="max-w-3xl mx-auto text-lg sm:text-xl leading-relaxed">
           For the first time, homeowners will elect two representatives to our HOA Board—joining three developer-appointed members. These seats will set the tone for the transition to a fully homeowner-led board in the near future.
         </p>
         <p className="max-w-3xl mx-auto text-lg sm:text-xl">
           I’m <strong>Doug Charles</strong>—and I’m running to listen, advocate, and represent every neighborhood in Windsong Ranch with transparency, fiscal responsibility, and an open door for every neighbor.
         </p>
         <div className="flex flex-wrap justify-center gap-4 mt-4">
           <Link
             href={{ pathname: '/', query: { form: 'endorsement' }, hash: 'get-involved' }}
             className="px-6 py-3 bg-coral text-white rounded-full hover:bg-coral/90"
           >
             Endorse Doug
           </Link>
           <Link
             href={{ pathname: '/', query: { form: 'updates' }, hash: 'get-involved' }}
             className="px-6 py-3 bg-lagoon-light text-lagoon rounded-full hover:bg-lagoon-light/90"
           >
             Get Involved
           </Link>
         </div>
       </section>
 
       {/* Promises */}
-      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
-        <div className="card">
+      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
+        <div className="card flex flex-col items-center text-center">
+          <Eye className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
           <h3 className="text-xl font-semibold mb-2">Ensure Transparency & Accountability</h3>
           <p>I will ensure every assessment, contract, and decision is clear and accessible to you. I’ll fight for open budgets, public explanations, and genuine two‑way dialogue.</p>
           <p className="quote mt-2">“Transparent governance isn’t optional—it’s a promise I make to you.”</p>
         </div>
-        <div className="card">
+        <div className="card flex flex-col items-center text-center">
+          <Megaphone className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
           <h3 className="text-xl font-semibold mb-2">Empower Homeowners & Amplify Your Voice</h3>
           <p>Homeowners—not developers—should drive our policies. We’ll staff committees with Windsong’s talented, passionate, and expert residents—and I’ll always be available to listen and advocate for your concerns.</p>
           <p className="quote mt-2">“Boards don’t own communities—homeowners do. Together we will build a board that serves you, not itself.”</p>
         </div>
-        <div className="card">
+        <div className="card flex flex-col items-center text-center">
+          <Users className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
           <h3 className="text-xl font-semibold mb-2">Unite Windsong</h3>
           <p>Townhomes, Villas, Peninsula, Crosswater, and every street—no neighborhood left behind. Our diversity is our strength, and we are stronger together.</p>
           <p className="quote mt-2">“Diverse in character, united in purpose—one Windsong, one voice.”</p>
         </div>
-        <div className="card">
+        <div className="card flex flex-col items-center text-center">
+          <PiggyBank className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
           <h3 className="text-xl font-semibold mb-2">Protect Our Lifestyle & Practice Fiscal Stewardship</h3>
           <p>I’ll safeguard our reserve fund, minimize unnecessary assessment increases, and ensure our contracts deliver real value. We’ll protect and enhance our amenities—The Lagoon, trails, parks, and green spaces—so Windsong stays vibrant and thriving.</p>
           <p className="quote mt-2">“Our lifestyle is our legacy. I’ll ensure it’s preserved for all of us, today and tomorrow.”</p>
         </div>
       </section>
 
       {/* Meet Doug */}
       <section id="about">
         <h2 className="text-2xl sm:text-3xl font-bold mb-4">Meet Doug</h2>
         <p className="mb-4">
           <strong>Doug Charles</strong> has proudly called Windsong Ranch home since 2015, living in both Crosswater and the Peninsula. As a long‑time resident, husband, and father, he believes leadership is an act of service—not a pursuit of status. With more than 25&nbsp;years of executive leadership in financial services, Doug currently serves as a Senior Vice President overseeing multi‑million‑dollar budgets, complex vendor contracts, and national compliance operations. Doug’s civic service runs deep: two terms on Prosper’s Planning &amp; Zoning Commission, membership on the Town Bond Committee, and previous roles on HOA boards. In every position, he has championed fair representation, strategic growth, and fiscal stewardship. Doug listens first, leads collaboratively, and believes every assessment, contract, and resource should reflect homeowners’ interests—not just a select few. As Windsong Ranch transitions toward full homeowner governance, he is committed to guiding the community with transparency, integrity, and a deep love for his neighbors.
         </p>
         <div className="quote">“Leadership isn’t about titles—it’s about service, stewardship, and listening to every voice.”</div>
       </section>
 
       {/* Endorsements display */}
       {endorsements.length > 0 && (
         <section>
           <h2 className="text-2xl sm:text-3xl font-bold mb-4">Endorsements</h2>
           {/* Use auto-rotating carousel */}
           <EndorsementsCarousel endorsements={endorsements} />
         </section>
       )}
 
       {/* Lifestyle section */}
