import propTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AdvisoriesTable from '../../PresentationalComponents/AdvisoriesTable/AdvisoriesTable';
import { systemAdvisoriesColumns } from '../../PresentationalComponents/AdvisoriesTable/AdvisoriesTableAssets';
import Error from '../../PresentationalComponents/Snippets/Error';
import { changeSystemAdvisoryListParams, clearSystemAdvisoriesStore, expandSystemAdvisoryRow,
    fetchApplicableSystemAdvisories, selectSystemAdvisoryRow } from '../../store/Actions/Actions';
import { STATUS_REJECTED } from '../../Utilities/constants';
import { createSystemAdvisoriesRows } from '../../Utilities/DataMappers';
import { arrayFromObj, createSortBy, decodeQueryparams, encodeURLParams,
    getRowIdByIndexExpandable, remediationProvider } from '../../Utilities/Helpers';
import { usePerPageSelect, useSetPage, useSortColumn } from '../../Utilities/Hooks';
import { NoSystemData } from '../../PresentationalComponents/Snippets/NoSystemData';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

const SystemAdvisories = ({ history }) => {
    const dispatch = useDispatch();
    const [firstMount, setFirstMount] = React.useState(true);
    const advisories = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.rows
    );

    const entity = useSelector(({ entityDetails }) => entityDetails.entity);

    const expandedRows = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.expandedRows
    );
    const queryParams = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.queryParams
    );
    const selectedRows = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.selectedRows
    );
    const metadata = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.metadata
    );
    const status = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.status
    );
    const error = useSelector(
        ({ SystemAdvisoryListStore }) => SystemAdvisoryListStore.error
    );
    const rows = React.useMemo(
        () =>
            createSystemAdvisoriesRows(advisories, expandedRows, selectedRows),
        [advisories, expandedRows, selectedRows]
    );

    React.useEffect(() => {
        return () => dispatch(clearSystemAdvisoriesStore());
    }, []);

    React.useEffect(() => {
        if (firstMount) {
            apply(decodeQueryparams(history.location.search));
            setFirstMount(false);
        } else {
            history.push(encodeURLParams(queryParams));
            dispatch(
                fetchApplicableSystemAdvisories({ id: entity.id, ...queryParams })
            );
        }
    }, [queryParams]);

    const onCollapse = React.useCallback((_, rowId, value) =>
        dispatch(
            expandSystemAdvisoryRow({
                rowId: getRowIdByIndexExpandable(advisories, rowId),
                value
            })
        )
    );

    const onSelect = React.useCallback((event, selected, rowId) => {
        const toSelect = [];
        switch (event) {
            case 'none': {
                Object.keys(selectedRows).forEach(id=>{
                    toSelect.push(
                        {
                            id,
                            selected: false
                        }
                    );
                });
                break;
            }

            case 'page': {
                advisories.forEach(({ id })=>{
                    toSelect.push(
                        {
                            id,
                            selected: true
                        }
                    );});
                break;
            }

            default: {
                toSelect.push({
                    id: getRowIdByIndexExpandable(advisories, rowId),
                    selected
                });
            }}

        dispatch(
            selectSystemAdvisoryRow(toSelect)
        );}
    );

    const onSort = useSortColumn(systemAdvisoriesColumns, apply, 2);
    const sortBy = React.useMemo(
        () => createSortBy(systemAdvisoriesColumns, metadata.sort, 2),
        [metadata.sort]
    );
    const onSetPage = useSetPage(metadata.limit, apply);
    const onPerPageSelect = usePerPageSelect(apply);

    function apply(params) {
        dispatch(changeSystemAdvisoryListParams({ id: entity.id, ...params }));
    }

    const errorState = error.status === 404 ?  <NoSystemData/> : <Error message={error.detail}/>;

    if (status === STATUS_REJECTED && error.status !== 404) {
        dispatch(addNotification({
            variant: 'danger',
            title: error.title,
            description: error.detail
        }));}

    return (
        <React.Fragment>
            {status === STATUS_REJECTED ? errorState : <AdvisoriesTable
                columns={systemAdvisoriesColumns}
                onCollapse={onCollapse}
                onSelect={(advisories.length && onSelect) || undefined}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                onSort={onSort}
                sortBy={sortBy}
                remediationProvider={() =>
                    remediationProvider(arrayFromObj(selectedRows), entity.id)
                }
                selectedRows={selectedRows}
                systemId={entity.id}
                apply={apply}
                store={{ rows, metadata, status, queryParams }}
            />}
        </React.Fragment>
    );
};

SystemAdvisories.propTypes = {
    history: propTypes.object
};
export default withRouter(SystemAdvisories);
