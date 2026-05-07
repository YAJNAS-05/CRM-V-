import React, { useState } from 'react'
import { toast } from 'sonner'

type BenefitCategory = 'Health' | 'Dental' | 'Vision' | 'Life Insurance' | 'Retirement' | 'Wellness'

type BenefitPlan = {
  id: string
  name: string
  category: BenefitCategory
  description: string
  employeeCost: number
  employerCost: number
  coverageLevel: 'Individual' | 'Employee + Spouse' | 'Family'
}

type EnrollmentStatus = 'enrolled' | 'waived' | 'pending'

type Enrollment = {
  planId: string
  status: EnrollmentStatus
  effectiveDate: string
  dependents: string[]
}

const BENEFIT_PLANS: BenefitPlan[] = [
  { id: 'health-basic', name: 'Health Basic (PPO)', category: 'Health', description: 'Standard PPO plan with nationwide coverage, $500 deductible.', employeeCost: 120, employerCost: 480, coverageLevel: 'Individual' },
  { id: 'health-premium', name: 'Health Premium (PPO+)', category: 'Health', description: 'Comprehensive PPO+ plan, $0 deductible, expanded specialist network.', employeeCost: 240, employerCost: 760, coverageLevel: 'Family' },
  { id: 'dental-basic', name: 'Dental Essential', category: 'Dental', description: 'Covers preventive, basic restorative. 80% coverage on most procedures.', employeeCost: 18, employerCost: 32, coverageLevel: 'Individual' },
  { id: 'dental-ortho', name: 'Dental Plus (with Ortho)', category: 'Dental', description: 'Includes orthodontic coverage for adults and children.', employeeCost: 38, employerCost: 42, coverageLevel: 'Family' },
  { id: 'vision', name: 'Vision Care', category: 'Vision', description: '$150 frames allowance, exams covered. Major optical networks.', employeeCost: 12, employerCost: 18, coverageLevel: 'Individual' },
  { id: 'life-1x', name: 'Group Life (1× salary)', category: 'Life Insurance', description: 'Company-paid basic life insurance equal to 1× annual salary.', employeeCost: 0, employerCost: 25, coverageLevel: 'Individual' },
  { id: 'life-3x', name: 'Voluntary Life (3× salary)', category: 'Life Insurance', description: 'Supplemental life up to 3× salary. AD&D included.', employeeCost: 45, employerCost: 0, coverageLevel: 'Individual' },
  { id: 'retirement-401k', name: '401(k) Plan', category: 'Retirement', description: 'Pre-tax contributions up to IRS limits. Employer matches 4%.', employeeCost: 0, employerCost: 0, coverageLevel: 'Individual' },
  { id: 'wellness', name: 'Wellness Reimbursement', category: 'Wellness', description: '$600/year reimbursement for gym, fitness, and wellness activities.', employeeCost: 20, employerCost: 80, coverageLevel: 'Individual' },
]

const CATEGORY_COLORS: Record<BenefitCategory, string> = {
  'Health': 'bg-blue-50 text-blue-700 border-blue-200',
  'Dental': 'bg-purple-50 text-purple-700 border-purple-200',
  'Vision': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Life Insurance': 'bg-rose-50 text-rose-700 border-rose-200',
  'Retirement': 'bg-amber-50 text-amber-700 border-amber-200',
  'Wellness': 'bg-green-50 text-green-700 border-green-200',
}

const categories: BenefitCategory[] = ['Health', 'Dental', 'Vision', 'Life Insurance', 'Retirement', 'Wellness']

const BenefitEnrollmentPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({})
  const [activeCategory, setActiveCategory] = useState<BenefitCategory | 'All'>('All')
  const [step, setStep] = useState<'select' | 'review' | 'confirm'>('select')
  const [effectiveDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1, 1)
    return d.toISOString().slice(0, 10)
  })

  const handleEnroll = (planId: string) => {
    setEnrollments(prev => ({
      ...prev,
      [planId]: { planId, status: 'enrolled', effectiveDate, dependents: [] },
    }))
    toast.success('Plan added to cart')
  }

  const handleWaive = (planId: string) => {
    setEnrollments(prev => ({
      ...prev,
      [planId]: { planId, status: 'waived', effectiveDate, dependents: [] },
    }))
    toast.info('Plan waived')
  }

  const handleRemove = (planId: string) => {
    setEnrollments(prev => {
      const next = { ...prev }
      delete next[planId]
      return next
    })
  }

  const handleSubmit = () => {
    setStep('confirm')
    toast.success('Benefit elections submitted successfully!')
  }

  const enrolledPlans = BENEFIT_PLANS.filter(p => enrollments[p.id]?.status === 'enrolled')
  const totalMonthlyCost = enrolledPlans.reduce((s, p) => s + p.employeeCost, 0)

  const filteredPlans = BENEFIT_PLANS.filter(p => activeCategory === 'All' || p.category === activeCategory)

  if (step === 'confirm') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Enrollment Confirmed!</h2>
          <p className="text-gray-500 mb-6">Your benefit elections have been submitted. Coverage begins {effectiveDate}.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            {enrolledPlans.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{p.name}</span>
                <span className="text-gray-500">${p.employeeCost}/mo</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
              <span>Total Monthly Cost</span>
              <span>${totalMonthlyCost}/mo</span>
            </div>
          </div>
          <button onClick={() => { setStep('select'); setEnrollments({}) }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            Start New Enrollment
          </button>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Review &amp; Submit</h1>
            <p className="text-gray-500 mt-1">Confirm your benefit elections for {effectiveDate}</p>
          </div>
        </div>

        {enrolledPlans.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-medium">No plans selected. Go back and enroll in at least one plan.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {enrolledPlans.map(plan => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[plan.category]}`}>{plan.category}</span>
                    <h3 className="font-bold text-gray-800">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{plan.coverageLevel} • Effective {effectiveDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">${plan.employeeCost}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                  <p className="text-xs text-gray-400">+${plan.employerCost} employer</p>
                </div>
              </div>
            ))}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-indigo-900">Total Monthly Deduction</p>
                <p className="text-xs text-indigo-600">Annual: ${(totalMonthlyCost * 12).toLocaleString()}</p>
              </div>
              <p className="text-3xl font-black text-indigo-700">${totalMonthlyCost}<span className="text-base font-normal text-indigo-400">/mo</span></p>
            </div>
          </div>
        )}

        {enrolledPlans.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Acknowledgement</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              By submitting, I acknowledge that my benefit elections are accurate and will be effective as of the stated date. Changes may only be made during open enrollment or qualifying life events. Pre-tax deductions are subject to IRS Section 125 plan rules.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep('select')}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
            Back to Selection
          </button>
          {enrolledPlans.length > 0 && (
            <button onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm shadow-indigo-200">
              Submit Elections →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Benefit Enrollment</h1>
            <p className="text-gray-500 mt-2">Select your benefit plans. Coverage begins {effectiveDate}.</p>
          </div>
          <button onClick={() => setStep('review')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm shadow-indigo-200">
            Review ({enrolledPlans.length}) →
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['All', ...categories] as const).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlans.map(plan => {
            const enrollment = enrollments[plan.id]
            const isEnrolled = enrollment?.status === 'enrolled'
            const isWaived = enrollment?.status === 'waived'
            return (
              <div key={plan.id} className={`bg-white rounded-2xl border shadow-sm p-6 transition ${isEnrolled ? 'border-indigo-300 ring-2 ring-indigo-100' : isWaived ? 'border-gray-200 opacity-60' : 'border-gray-100 hover:border-indigo-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[plan.category]}`}>{plan.category}</span>
                    <h3 className="font-bold text-gray-900 mt-2">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.coverageLevel}</p>
                  </div>
                  {isEnrolled && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Enrolled
                    </span>
                  )}
                  {isWaived && (
                    <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">Waived</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xl font-black text-gray-900">${plan.employeeCost}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                    {plan.employerCost > 0 && <p className="text-xs text-green-600">+${plan.employerCost} employer pays</p>}
                    {plan.employerCost === 0 && plan.employeeCost === 0 && <p className="text-xs text-indigo-600">Contribution-based</p>}
                  </div>
                  <div className="flex gap-2">
                    {!isEnrolled && (
                      <button onClick={() => handleEnroll(plan.id)}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                        Enroll
                      </button>
                    )}
                    {isEnrolled && (
                      <button onClick={() => handleRemove(plan.id)}
                        className="px-4 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 font-medium">
                        Remove
                      </button>
                    )}
                    {!isWaived && !isEnrolled && (
                      <button onClick={() => handleWaive(plan.id)}
                        className="px-4 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">
                        Waive
                      </button>
                    )}
                    {isWaived && (
                      <button onClick={() => handleRemove(plan.id)}
                        className="px-4 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky footer summary */}
        {enrolledPlans.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6">
            <div>
              <p className="text-xs text-indigo-300">{enrolledPlans.length} plan{enrolledPlans.length !== 1 ? 's' : ''} selected</p>
              <p className="font-black text-lg">${totalMonthlyCost}/mo total cost</p>
            </div>
            <button onClick={() => setStep('review')}
              className="bg-white text-indigo-900 px-5 py-2 rounded-xl font-bold hover:bg-indigo-50 text-sm">
              Review &amp; Submit →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BenefitEnrollmentPage
