import _ from 'lodash'
import moment from 'moment'
import React from 'react'
import PT from 'prop-types'
import TextTruncate from 'react-text-truncate'
import { getProjectTemplateByKey } from '../../../helpers/templates'
import ProjectTypeIcon from '../../../components/ProjectTypeIcon'
import NotificationBadge from '../../../components/NotificationBadge/NotificationBadge'
import './ProjectCardHeader.scss'

function ProjectCardHeader({ project, onClick, projectTemplates, unreadMentionsCount}) {
  if (!project) return null

  const projectTemplateId = project.templateId
  const projectTemplateKey = _.get(project, 'details.products[0]')
  const projectTemplate = projectTemplateId
    ? _.find(projectTemplates, pt => pt.id === projectTemplateId)
    : getProjectTemplateByKey(projectTemplates, projectTemplateKey)
  // icon for the product, use default generic work project icon for categories which no longer exist now
  const productIcon = _.get(projectTemplate, 'icon', 'tech-32px-outline-work-project')
  const templateName = _.get(projectTemplate, 'name', null)
  const projectType = project.type !== undefined ? project.type[0].toUpperCase() + project.type.substr(1).replace(/_/g, ' ') : null
  return (
    <div className="project-card-header" onClick={onClick}>
      <div className="project-header">
        <span className="badge-wrapper">
          { unreadMentionsCount > 0 && <NotificationBadge count={unreadMentionsCount} /> }
        </span>
        <div className="project-type-icon" title={templateName ? templateName : projectType}>
          <ProjectTypeIcon type={productIcon} />
        </div>
        <div className="project-header-details">
          <div className="project-name">
            <TextTruncate
              containerClassName="project-name"
              line={2}
              truncateText="..."
              text={_.unescape(project.name)}
            />
          </div>
          <div className="project-date">{moment(project.updatedAt).format('MMM DD, YYYY')}</div>
        </div>
      </div>
    </div>
  )
}

ProjectCardHeader.defaultTypes = {
}

ProjectCardHeader.propTypes = {
  project: PT.object.isRequired,
  projectTemplates: PT.array.isRequired,
  onClick: PT.func,
  unreadMentionsCount: PT.number
}

export default ProjectCardHeader
