import React from 'react'
import PropTypes from 'prop-types'
import ListHeader from './ListHeader'
import ListItem from './ListItem'
import PaginationBar from './PaginationBar'
import Placeholder from './Placeholder'
import InfiniteScroll from 'react-infinite-scroller'
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator'
import NewProjectCard from '../../projects/components/projectsCard/NewProjectCard'
import './GridView.scss'


const GridView = props => {
  const { columns, sortHandler, currentSortField, ListComponent, resultSet, onPageChange, noMoreResultsMessage,
    totalCount, pageSize, currentPageNum, infiniteScroll, infiniteAutoload, isLoading, setInfiniteAutoload,
    applyFilters, entityNamePlural, newProjectLink,
    // entityName
  } = props
  const paginationProps = { totalCount, pageSize, currentPageNum, onPageChange }
  const headerProps = { columns, sortHandler, currentSortField }
  let noMoreResultsMsg = noMoreResultsMessage
  noMoreResultsMsg = noMoreResultsMsg ? noMoreResultsMsg : `No more ${entityNamePlural}`

  const renderItem = (item, index) => {
    return item.isPlaceholder ? <Placeholder columns={columns} key={`placeholder-${index}`} /> : <ListComponent columns={columns} item={item} key={item.id}/>
  }

  const handleLoadMore = () => {
    onPageChange(currentPageNum + 1)
    setInfiniteAutoload(true)
  }

  const renderGridWithPagination = () => (
    isLoading ? (
      <LoadingIndicator />
    ) : (
      <div className="container">
        <div className="flex-area">
          <div className="flex-data">
            <ListHeader {...headerProps} />
            {resultSet.length ? (
              resultSet.map(renderItem)
            ) : (
              <div style={{textAlign: 'center'}}><br/><br/><h3> No results </h3><br/><br/></div>
            )}
          </div>
          <PaginationBar {...paginationProps} />
        </div>
      </div>
    )
  )

  const renderGridWithInfiniteScroll = () => {
    const hasMore = currentPageNum * pageSize < totalCount
    const placeholders = []
    if (isLoading & hasMore) {
      for (let i = 0; i < pageSize; i++) {
        placeholders.push({ isPlaceholder: true })
      }
    }

    return (
      <div>
        <div className="container">
          <div className="flex-area">
            <div className="flex-data">
              <ListHeader {...headerProps} />
              <InfiniteScroll
                initialLoad={false}
                pageStart={currentPageNum}
                loadMore={infiniteAutoload && !isLoading ? onPageChange : () => {}}
                hasMore={hasMore}
                threshold={500}
              >
                {[...resultSet, ...placeholders].map(renderItem)}
              </InfiniteScroll>
              {totalCount === 0 && <section className="content gridview-content">
                <div key="end" className="gridview-no-project">
                  No results found based on current search criteria. <br /> Please modify your search criteria and/or search across all projects by selecting the "
                  <a href="javascript:" onClick={() => { applyFilters({status: null }) }} className="tc-btn-all-projects" >
                    All Projects
                  </a>
                  " filter.
                </div>
              </section>}
            </div>
          </div>
        </div>
        { false && isLoading && <LoadingIndicator /> }
        { !isLoading && !infiniteAutoload && hasMore &&
            <div className="gridview-load-more">
              <button type="button" className="tc-btn tc-btn-primary" onClick={handleLoadMore} key="loadMore">Load more {entityNamePlural}</button>
            </div>
        }
        { !isLoading && !hasMore && <div key="end" className="gridview-no-more">{noMoreResultsMsg}</div>}
        {!!newProjectLink && <div className="project-card project-card-new">
          <NewProjectCard link={newProjectLink} />
        </div>}
      </div>
    )
  }

  return (
    <section className="content gridview-content">
      {infiniteScroll ? renderGridWithInfiniteScroll() : renderGridWithPagination()}
    </section>
  )
}

GridView.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPageChange: PropTypes.func.isRequired,
  sortHandler: PropTypes.func.isRequired,
  currentSortField: PropTypes.string.isRequired,
  ListComponent: PropTypes.func,
  resultSet: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  currentPageNum: PropTypes.number.isRequired,
  infiniteAutoload: PropTypes.bool,
  infiniteScroll: PropTypes.bool,
  setInfiniteAutoload: PropTypes.func,
  applyFilters: PropTypes.func,
  newProjectLink: PropTypes.string
}

GridView.defaultProps = {
  infiniteScroll: false,
  ListComponent: ListItem
}
export default GridView
