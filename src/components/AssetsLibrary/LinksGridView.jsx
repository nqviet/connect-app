import React from 'react'
import PropTypes from 'prop-types'
import uncontrollable from 'uncontrollable'
import cn from 'classnames'
import { Link } from 'react-router-dom'
import _ from 'lodash'

import DeleteLinkModal from '../LinksMenu/DeleteLinkModal'
import EditLinkModal from '../LinksMenu/EditLinkModal'
import SubFolder from './SubFolder'
import ItemOperations from './ItemOperations'
import UserTooltip from '../User/UserTooltip'

import FolderIcon from '../../assets/icons/v.2.5/icon-folder-small.svg'
import LinkIcon from '../../assets/icons/link-12.svg'

import './GridView.scss'
import {
  PROJECT_ASSETS_SHARED_WITH_ALL_MEMBERS,
  PROJECT_ASSETS_SHARED_WITH_TOPCODER_MEMBERS,
  PROJECT_FEED_TYPE_MESSAGES
} from '../../config/constants'
import FilterColHeader from './FilterColHeader'

let selectedLink
let clearing = false

const LinksGridView = ({
  canDelete,
  canEdit,
  links,
  linkToDelete,
  linkToEdit,
  subFolderContent,
  onChangeSubFolder,
  onDelete,
  onDeleteIntent,
  onEdit,
  onEditIntent,
  title,
  formatModifyDate,
  formatFolderTitle,
  assetsMembers,
  setFilter,
  getFilterValue,
  clearFilter,
  filtered
}) => {
  let nameFieldRef
  let sharedWithFieldRef
  let dateFieldRef
  
  const updateSubContents = () => {
    if (selectedLink) {
      let link = links.filter(item => {
        return selectedLink.title === item.title
          && selectedLink.createdBy === item.createdBy
          && selectedLink.updatedAt === item.updatedAt
      })[0]
      
      if (!link) {
        link = _.cloneDeep(selectedLink)
        link.children = []
      }
      
      onChangeSubFolder(link)
    }
  }
  
  const clearSubContents = () => clearing = true
  
  const clearFieldValues = () => {
    nameFieldRef.clearFilter()
    sharedWithFieldRef.clearFilter()
    dateFieldRef.clearFilter()
  }
  
  const renderLink = (link) => {
    if (link.onClick) {
      return (
        <a
          href={link.address}
          onClick={(evt) => {
            // we only prevent default on click,
            // as we handle clicks with <li>
            if (!link.allowDefaultOnClick) {
              evt.preventDefault()
            }
          }}
        >
          {link.title}
        </a>)
    } else if (link.noNewPage) {
      return <Link to={link.address}>{link.title}</Link>
    } else {
      return <a href={link.address} target="_blank" rel="noopener noreferrer">{link.title}</a>
    }
  }
  const goBack = () => {
    onChangeSubFolder(null)
    selectedLink = null
  }
  
  const getSharedWithText = (tag) => {
    return tag === PROJECT_FEED_TYPE_MESSAGES
      ? PROJECT_ASSETS_SHARED_WITH_TOPCODER_MEMBERS : PROJECT_ASSETS_SHARED_WITH_ALL_MEMBERS
  }
  
  if (clearing) {
    setTimeout(() => {
      updateSubContents()
      clearing = false
    })
  }
  
  return (
    <div styleName="assets-gridview-container">
      {(subFolderContent) && (
        <SubFolder
          link={ subFolderContent }
          renderLink={ renderLink }
          goBack={goBack}
          assetsMembers={assetsMembers}
          isLinkSubFolder
          formatModifyDate={formatModifyDate}
          setFilter={setFilter}
          getFilterValue={getFilterValue}
          clearFilter={clearFilter}
          updateSubContents={updateSubContents}
          clearSubContents={clearSubContents}
          filtered={filtered}
        />)}
      {(!subFolderContent) && (
        <div styleName={cn({'assets-gridview-container-active': (linkToEdit >= 0  || linkToDelete >= 0)}, '')}>
          {(linkToEdit >= 0 || linkToDelete >= 0) && <div styleName="assets-gridview-modal-overlay"/>}
          <div styleName="assets-gridview-title">
            {`${filtered ? 'Filtered' : 'All'} ${title}`}
            {filtered && (
              <button
                className="tc-btn tc-btn-default"
                onClick={() => {
                  clearFilter()
                  clearFieldValues()
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
          <ul>
            <li styleName={cn('assets-gridview-header', { 'disabled': linkToEdit >= 0 || linkToDelete >= 0 })} key="assets-gridview-header">
              <div styleName="flex-item-title item-type">Type</div>
              <div styleName="flex-item-title item-name">
                <FilterColHeader
                  ref={(comp) => nameFieldRef = comp}
                  title="Name"
                  setFilter={setFilter}
                  filterName="name"
                  value={getFilterValue('name')}
                />
              </div>
              <div styleName="flex-item-title item-shared-with">
                <FilterColHeader
                  ref={(comp) => sharedWithFieldRef = comp}
                  title="Shared With"
                  filterName="sharedWith"
                  setFilter={setFilter}
                  value={getFilterValue('sharedWith')}
                />
              </div>
              <div styleName="flex-item-title item-created-by">Created By</div>
              <div styleName="flex-item-title item-modified">
                <FilterColHeader
                  ref={(comp) => dateFieldRef = comp}
                  type="date"
                  title="Date"
                  setFilter={setFilter}
                  from={getFilterValue('date.from')}
                  to={getFilterValue('date.to')}
                />
              </div>
              <div styleName="flex-item-title item-action"/>
            </li>
            {links.map((link, idx) => {
              const onDeleteConfirm = () => {
                onDelete(idx)
                onDeleteIntent(-1)
              }
              const onDeleteCancel = () => onDeleteIntent(-1)
              const handleDeleteClick = () => onDeleteIntent(idx)

              const onEditConfirm = (title, address) => {
                onEdit(idx, title, address)
                onEditIntent(-1)
              }
              const onEditCancel = () => onEditIntent(-1)
              const handleEditClick = () => onEditIntent(idx)
              const changeSubFolder = () => {
                onChangeSubFolder(link)
                selectedLink = link
              }
              const owner = _.find(assetsMembers, m => m.userId === _.parseInt(link.createdBy))
              
              if (Array.isArray(link.children) && link.children.length > 0) {
                return (
                  <li styleName="assets-gridview-row" onClick={changeSubFolder} key={'assets-gridview-folder-' + idx}>
                    <div styleName="flex-item item-type"><FolderIcon /></div>
                    <div styleName="flex-item item-name hand"><p>{formatFolderTitle(link.title)}</p></div>
                    <div styleName="flex-item item-shared-with">
                      <p>
                        {getSharedWithText(link.tag)}
                      </p>
                    </div>
                    <div styleName="flex-item item-created-by">
                      {!owner && !link.createdBy && (<div className="user-block">—</div>)}
                      {!owner && link.createdBy !== 'CoderBot' && (<div className="user-block txt-italic">Unknown</div>)}
                      {!owner && link.createdBy === 'CoderBot' && (<div className="user-block">CoderBot</div>)}
                      {owner && (
                        <div className="spacing">
                          <div className="user-block">
                            <UserTooltip usr={owner} id={idx} size={35} />
                          </div>
                        </div>)}
                    </div>
                    <div styleName="flex-item item-modified">{formatModifyDate(link)}</div>
                    <div styleName="flex-item item-action"/>
                  </li>)
              } else if (linkToDelete === idx) {
                return (
                  <li styleName="delete-confirmation-modal" key={ 'delete-confirmation-' + idx }>
                    <DeleteLinkModal
                      link={ link }
                      onCancel={ onDeleteCancel }
                      onConfirm={ onDeleteConfirm }
                    />
                  </li>)
              } else if (linkToEdit === idx) {
                return (
                  <li styleName="delete-confirmation-modal" key={ 'delete-confirmation-' + idx }>
                    <EditLinkModal
                      link={ link }
                      onCancel={ onEditCancel }
                      onConfirm={ onEditConfirm }
                    />
                  </li>)
              } else {
                return (
                  <li styleName="assets-gridview-row" key={'assets-gridview-item-' +idx}>
                    <div styleName="flex-item item-type"><LinkIcon/></div>
                    <div styleName="flex-item item-name"><p>{renderLink(link)}</p></div>
                    <div styleName="flex-item item-shared-with">
                      <p>
                        {getSharedWithText(link.tag)}
                      </p>
                    </div>
                    <div styleName="flex-item item-created-by">
                      {!owner && !link.createdBy && (<div className="user-block">—</div>)}
                      {!owner && link.createdBy && (<div className="user-block txt-italic">Unknown</div>)}
                      {owner && (
                        <div className="spacing">
                          <div className="user-block">
                            <UserTooltip usr={owner} id={idx} size={35} />
                          </div>
                        </div>)}
                    </div>
                    <div styleName="flex-item item-modified">{formatModifyDate(link)}</div>
                    <div styleName="flex-item item-action">
                      {(canEdit || canDelete) && (
                        <ItemOperations
                          canEdit={canEdit}
                          canDelete={canDelete}
                          handleEditClick={handleEditClick}
                          handleDeleteClick={handleDeleteClick}
                        />)}
                    </div>
                  </li>)}
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

LinksGridView.propTypes = {
  canDelete: PropTypes.bool,
  canEdit: PropTypes.bool,
  links: PropTypes.array.isRequired,
  onChangeSubFolder: PropTypes.func,
  onDelete: PropTypes.func,
  title: PropTypes.string,
  formatModifyDate: PropTypes.func.isRequired,
  formatFolderTitle: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  getFilterValue: PropTypes.func.isRequired,
  clearFilter: PropTypes.func.isRequired,
  filtered: PropTypes.bool
}

LinksGridView.defaultProps = {
  title: 'Links',
  subFolderContent: null,
}

export default uncontrollable(LinksGridView, {
  linkToDelete: 'onDeleteIntent',
  linkToEdit: 'onEditIntent',
  subFolderContent: 'onChangeSubFolder'
})
