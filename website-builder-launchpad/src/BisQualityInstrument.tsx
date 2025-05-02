import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Table, Progress, Card, Button, Input, Select, Radio, Checkbox, Alert, Divider, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './BisQualityInstrument.css';

type Dimension = {
  id: string;
  name: string;
  description: string;
  weight: number;
  criteria: Criterion[];
};

type Criterion = {
  id: string;
  description: string;
  maxScore: number;
  guidance: string;
};

type AssessmentResult = {
  dimensionId: string;
  criterionId: string;
  score: number;
  notes: string;
};

const dimensions: Dimension[] = [
  {
    id: 'data-quality',
    name: 'Data Quality',
    description: 'Accuracy, completeness, consistency, and timeliness of data',
    weight: 25,
    criteria: [
      {
        id: 'dq-1',
        description: 'Data accuracy (free from errors)',
        maxScore: 5,
        guidance: 'Verify sample data against source systems'
      },
      {
        id: 'dq-2',
        description: 'Data completeness (no missing values)',
        maxScore: 5,
        guidance: 'Check for null/empty values in key fields'
      },
      {
        id: 'dq-3',
        description: 'Data consistency across sources',
        maxScore: 5,
        guidance: 'Compare values from different source systems'
      }
    ]
  },
  {
    id: 'system-performance',
    name: 'System Performance',
    description: 'Speed, reliability, and scalability of the BI solution',
    weight: 20,
    criteria: [
      {
        id: 'sp-1',
        description: 'Query response time for standard reports',
        maxScore: 5,
        guidance: 'Measure time for typical user queries'
      },
      {
        id: 'sp-2',
        description: 'System uptime and availability',
        maxScore: 5,
        guidance: 'Review monitoring logs for past 3 months'
      },
      {
        id: 'sp-3',
        description: 'Concurrent user capacity',
        maxScore: 5,
        guidance: 'Stress test with simulated user load'
      }
    ]
  },
  {
    id: 'user-experience',
    name: 'User Experience',
    description: 'Ease of use, navigation, and visualization quality',
    weight: 20,
    criteria: [
      {
        id: 'ue-1',
        description: 'Intuitiveness of interface',
        maxScore: 5,
        guidance: 'Conduct usability testing with new users'
      },
      {
        id: 'ue-2',
        description: 'Quality of data visualizations',
        maxScore: 5,
        guidance: 'Evaluate chart appropriateness and clarity'
      },
      {
        id: 'ue-3',
        description: 'Mobile accessibility',
        maxScore: 5,
        guidance: 'Test on various mobile devices'
      }
    ]
  },
  {
    id: 'business-value',
    name: 'Business Value',
    description: 'Alignment with business needs and decision-making impact',
    weight: 35,
    criteria: [
      {
        id: 'bv-1',
        description: 'Alignment with strategic objectives',
        maxScore: 5,
        guidance: 'Map features to stated business goals'
      },
      {
        id: 'bv-2',
        description: 'Decision-making impact',
        maxScore: 5,
        guidance: 'Interview executives on BI influence'
      },
      {
        id: 'bv-3',
        description: 'ROI realization',
        maxScore: 5,
        guidance: 'Compare benefits to implementation costs'
      }
    ]
  }
];

const BisQualityInstrument: React.FC = () => {
  const [currentDimension, setCurrentDimension] = useState<Dimension>(dimensions[0]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    industry: '',
    assessmentDate: new Date().toISOString().split('T')[0]
  });

  const { control, handleSubmit, watch } = useForm();

  // Calculate scores whenever results change
  useEffect(() => {
    if (results.length > 0) {
      const weightedSum = dimensions.reduce((sum, dimension) => {
        const dimensionResults = results.filter(r => r.dimensionId === dimension.id);
        if (dimensionResults.length === 0) return sum;
        
        const dimensionScore = dimensionResults.reduce((dimSum, result) => dimSum + result.score, 0) / 
                             (dimension.criteria.length * 5) * dimension.weight;
        return sum + dimensionScore;
      }, 0);
      
      setTotalScore(Math.round(weightedSum));
    }
  }, [results]);

  const handleScoreChange = (dimensionId: string, criterionId: string, score: number) => {
    setResults(prev => {
      const existingIndex = prev.findIndex(r => 
        r.dimensionId === dimensionId && r.criterionId === criterionId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], score };
        return updated;
      }
      
      return [...prev, { dimensionId, criterionId, score, notes: '' }];
    });
  };

  const handleNotesChange = (dimensionId: string, criterionId: string, notes: string) => {
    setResults(prev => {
      const existingIndex = prev.findIndex(r => 
        r.dimensionId === dimensionId && r.criterionId === criterionId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], notes };
        return updated;
      }
      
      return [...prev, { dimensionId, criterionId, score: 0, notes }];
    });
  };

  const getCriterionScore = (dimensionId: string, criterionId: string) => {
    const result = results.find(r => 
      r.dimensionId === dimensionId && r.criterionId === criterionId);
    return result ? result.score : 0;
  };

  const getDimensionScore = (dimension: Dimension) => {
    const dimensionResults = results.filter(r => r.dimensionId === dimension.id);
    if (dimensionResults.length === 0) return 0;
    
    const totalPossible = dimension.criteria.length * 5;
    const actualScore = dimensionResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round((actualScore / totalPossible) * 100);
  };

  const renderScoreQuality = (score: number) => {
    if (score >= 80) return <span className="score-high">Excellent</span>;
    if (score >= 60) return <span className="score-medium">Good</span>;
    if (score >= 40) return <span className="score-low">Fair</span>;
    return <span className="score-poor">Needs Improvement</span>;
  };

  const onSubmit = (data: any) => {
    console.log('Assessment completed:', { clientInfo, results, totalScore });
    setShowSummary(true);
  };

  return (
    <div className="bis-quality-container">
      <header className="bis-quality-header">
        <h1>BIS Quality Assessment Instrument</h1>
        <p>Comprehensive evaluation tool for Business Intelligence Systems</p>
      </header>

      {!showSummary ? (
        <div className="bis-quality-assessment">
          <Card className="client-info-card">
            <h2>Client Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Client Name</label>
                <Input 
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  placeholder="Enter client organization name"
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <Select
                  value={clientInfo.industry}
                  onChange={(value) => setClientInfo({...clientInfo, industry: value})}
                  options={[
                    { value: 'finance', label: 'Finance' },
                    { value: 'healthcare', label: 'Healthcare' },
                    { value: 'retail', label: 'Retail' },
                    { value: 'manufacturing', label: 'Manufacturing' },
                    { value: 'technology', label: 'Technology' },
                    { value: 'other', label: 'Other' }
                  ]}
                  placeholder="Select industry"
                />
              </div>
              <div className="form-group">
                <label>Assessment Date</label>
                <Input 
                  type="date"
                  value={clientInfo.assessmentDate}
                  onChange={(e) => setClientInfo({...clientInfo, assessmentDate: e.target.value})}
                />
              </div>
            </div>
          </Card>

          <div className="dimension-selector">
            <h3>Assessment Dimensions</h3>
            <div className="dimension-tabs">
              {dimensions.map(dim => (
                <button
                  key={dim.id}
                  className={`dimension-tab ${currentDimension.id === dim.id ? 'active' : ''}`}
                  onClick={() => setCurrentDimension(dim)}
                >
                  {dim.name}
                  <span className="weight-badge">{dim.weight}%</span>
                </button>
              ))}
            </div>
          </div>

          <Card className="dimension-card">
            <h2>{currentDimension.name}</h2>
            <p className="dimension-description">{currentDimension.description}</p>
            
            <div className="progress-summary">
              <Progress 
                percent={getDimensionScore(currentDimension)} 
                status="active" 
                format={percent => `${percent}%`}
              />
              <span className="progress-label">
                Current Score: {renderScoreQuality(getDimensionScore(currentDimension))}
              </span>
            </div>

            <Divider />

            <table className="criteria-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '40%' }}>Criterion</th>
                  <th style={{ width: '25%' }}>Guidance</th>
                  <th style={{ width: '20%' }}>Score (0-5)</th>
                  <th style={{ width: '10%' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {currentDimension.criteria.map((criterion, index) => {
                  const currentScore = getCriterionScore(currentDimension.id, criterion.id);
                  return (
                    <tr key={criterion.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="criterion-description">
                          {criterion.description}
                          <Tooltip title={criterion.guidance}>
                            <InfoCircleOutlined className="info-icon" />
                          </Tooltip>
                        </div>
                      </td>
                      <td className="guidance-cell">{criterion.guidance}</td>
                      <td>
                        <Select
                          value={currentScore}
                          onChange={(value) => handleScoreChange(currentDimension.id, criterion.id, value)}
                          options={[
                            { value: 0, label: '0 - Not met' },
                            { value: 1, label: '1 - Partially met' },
                            { value: 2, label: '2 - Minimally met' },
                            { value: 3, label: '3 - Adequately met' },
                            { value: 4, label: '4 - Well met' },
                            { value: 5, label: '5 - Fully met' }
                          ]}
                          style={{ width: '100%' }}
                        />
                      </td>
                      <td className="score-indicator">
                        {currentScore >= 3 ? (
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        ) : (
                          <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="notes-section">
              <h3>Assessment Notes</h3>
              {currentDimension.criteria.map(criterion => (
                <div key={criterion.id} className="note-item">
                  <label>{criterion.description}</label>
                  <Input.TextArea
                    value={results.find(r => 
                      r.dimensionId === currentDimension.id && 
                      r.criterionId === criterion.id)?.notes || ''}
                    onChange={(e) => 
                      handleNotesChange(currentDimension.id, criterion.id, e.target.value)}
                    placeholder="Enter observations, evidence, or recommendations"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            <div className="navigation-buttons">
              {dimensions.findIndex(d => d.id === currentDimension.id) > 0 && (
                <Button onClick={() => {
                  const currentIndex = dimensions.findIndex(d => d.id === currentDimension.id);
                  setCurrentDimension(dimensions[currentIndex - 1]);
                }}>
                  Previous Dimension
                </Button>
              )}
              
              {dimensions.findIndex(d => d.id === currentDimension.id) < dimensions.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={() => {
                    const currentIndex = dimensions.findIndex(d => d.id === currentDimension.id);
                    setCurrentDimension(dimensions[currentIndex + 1]);
                  }}
                >
                  Next Dimension
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  onClick={handleSubmit(onSubmit)}
                  disabled={results.length < dimensions.reduce((sum, dim) => sum + dim.criteria.length, 0)}
                >
                  Complete Assessment
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="bis-quality-summary">
          <Card className="summary-card">
            <h2>Assessment Summary</h2>
            <div className="overall-score">
              <Progress 
                type="circle" 
                percent={totalScore} 
                width={150}
                format={percent => (
                  <div className="score-display">
                    <span className="score-value">{percent}</span>
                    <span className="score-label">Overall Score</span>
                  </div>
                )}
              />
              <div className="score-description">
                <h3>{clientInfo.name}</h3>
                <p>Industry: {clientInfo.industry}</p>
                <p>Assessment Date: {clientInfo.assessmentDate}</p>
                <div className="quality-rating">
                  System Quality: {renderScoreQuality(totalScore)}
                </div>
              </div>
            </div>

            <Divider />

            <h3>Dimension Scores</h3>
            <div className="dimension-scores">
              {dimensions.map(dim => (
                <div key={dim.id} className="dimension-score-item">
                  <div className="dimension-header">
                    <h4>{dim.name}</h4>
                    <span className="dimension-weight">Weight: {dim.weight}%</span>
                  </div>
                  <Progress 
                    percent={getDimensionScore(dim)} 
                    status="active"
                    strokeColor={getDimensionScore(dim) >= 60 ? '#52c41a' : getDimensionScore(dim) >= 40 ? '#faad14' : '#f5222d'}
                  />
                  <div className="dimension-details">
                    {dim.criteria.map(crit => {
                      const result = results.find(r => r.dimensionId === dim.id && r.criterionId === crit.id);
                      return (
                        <div key={crit.id} className="criterion-result">
                          <span className="criterion-name">{crit.description}</span>
                          <span className="criterion-score">
                            Score: {result ? result.score : 0}/5
                            {result?.notes && (
                              <Tooltip title={result.notes}>
                                <InfoCircleOutlined className="notes-indicator" />
                              </Tooltip>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Divider />

            <h3>Recommendations</h3>
            <div className="recommendations">
              {totalScore >= 80 ? (
                <Alert
                  message="Excellent Implementation"
                  description="The BI system is well-implemented with only minor areas for improvement. Focus on continuous optimization and user training."
                  type="success"
                  showIcon
                />
              ) : totalScore >= 60 ? (
                <Alert
                  message="Good Implementation"
                  description="The BI system meets most requirements but has several areas needing improvement. Prioritize the lowest scoring dimensions."
                  type="info"
                  showIcon
                />
              ) : totalScore >= 40 ? (
                <Alert
                  message="Fair Implementation"
                  description="The BI system has significant gaps that impact its effectiveness. Consider a phased improvement plan."
                  type="warning"
                  showIcon
                />
              ) : (
                <Alert
                  message="Needs Major Improvement"
                  description="The BI system fails to meet basic requirements. A comprehensive review and redesign may be necessary."
                  type="error"
                  showIcon
                />
              )}

              <div className="specific-recommendations">
                {dimensions.filter(dim => getDimensionScore(dim) < 60).map(dim => (
                  <div key={dim.id} className="dimension-recommendation">
                    <h4>{dim.name} Improvements</h4>
                    <ul>
                      {dim.criteria
                        .filter(crit => {
                          const result = results.find(r => r.dimensionId === dim.id && r.criterionId === crit.id);
                          return result && result.score < 3;
                        })
                        .map(crit => (
                          <li key={crit.id}>
                            <strong>{crit.description}:</strong> {results.find(r => 
                              r.dimensionId === dim.id && 
                              r.criterionId === crit.id)?.notes || 'See assessment notes'}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            <div className="summary-actions">
              <Button type="primary">Generate PDF Report</Button>
              <Button>Save Assessment</Button>
              <Button onClick={() => setShowSummary(false)}>Back to Assessment</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BisQualityInstrument;