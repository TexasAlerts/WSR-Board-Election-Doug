"use client";

import {
  Ear,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

export default function PrioritiesPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4">
          My Priorities
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Common sense leadership guided by three core principles
        </p>
      </section>

      {/* Three Pillars */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="card text-center">
          <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ear className="w-10 h-10 text-navy" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-navy">Listen</h2>
          <p className="text-gray-600 leading-relaxed">
            Good decisions start with hearing from residents—not as an afterthought, but from the beginning. Your voice should shape outcomes before votes are taken.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-navy" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-navy">Plan</h2>
          <p className="text-gray-600 leading-relaxed">
            Build it right the first time. Right-size projects before we break ground. Think long-term so we're not fixing mistakes or asking for more money later.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-navy" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-navy">Protect</h2>
          <p className="text-gray-600 leading-relaxed">
            Growth isn't the enemy—losing our community character is. New development must match our infrastructure, schools, and quality of life.
          </p>
        </div>
      </section>

      {/* Detailed Priorities */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">What This Means for Prosper</h2>

          <div className="space-y-8">
            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Transparent Government</h3>
              <p className="text-gray-700 leading-relaxed">
                Every resident deserves to know what their local government is doing and why. I'll push for earlier public input on major decisions, clearer communication about town projects, and more accessible council meetings. The best decisions happen when residents are informed and engaged from the start.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Responsible Growth</h3>
              <p className="text-gray-700 leading-relaxed">
                Prosper is growing whether we like it or not. The question is whether we manage that growth wisely. That means ensuring new development pays its fair share, infrastructure keeps pace with rooftops, and we protect the quality of life that brought us all here. Growth should benefit existing residents, not just developers.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Fiscal Responsibility</h3>
              <p className="text-gray-700 leading-relaxed">
                Your tax dollars should be spent wisely. That means right-sizing projects from the start, planning for long-term maintenance costs, and being honest about what things really cost. I've worked on the bond committee and P&Z—I know how to read a budget and ask the tough questions.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Community Character</h3>
              <p className="text-gray-700 leading-relaxed">
                Prosper isn't just another suburb. We have a character worth preserving—great schools, safe neighborhoods, and a sense of community. Every zoning decision, every development approval, should be evaluated against whether it strengthens or weakens what makes Prosper special.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
