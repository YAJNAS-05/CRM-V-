import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnterpriseReportBuilder } from '@/components/reports/EnterpriseReportBuilder'

export const ReportBuilderPage = () => {
  const navigate = useNavigate()

  const handleSave = (report: any) => {
    navigate(`/reports/${report.reportId}`)
  }

  const handleCancel = () => {
    navigate('/reports')
  }

  return (
    <EnterpriseReportBuilder
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
