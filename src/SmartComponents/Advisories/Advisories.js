import { Main } from '@redhat-cloud-services/frontend-components';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdvisoriesTable from '../../PresentationalComponents/AdvisoriesTable/AdvisoriesTable';
import { advisoriesColumns } from '../../PresentationalComponents/AdvisoriesTable/AdvisoriesTableAssets';
import Header from '../../PresentationalComponents/Header/Header';
import {
    changeAdvisoryListParams,
    expandAdvisoryRow,
    fetchApplicableAdvisories,
    selectAdvisoryRow
} from '../../store/Actions/Actions';
import { createAdvisoriesRows } from '../../Utilities/DataMappers';
import { getRowIdByIndexExpandable } from '../../Utilities/Helpers';
import {
    usePerPageSelect,
    useSetPage,
    useSortColumn
} from '../../Utilities/Hooks';

const Advisories = () => {
    const dispatch = useDispatch();
    const advisories = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.rows
    );
    const expandedRows = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.expandedRows
    );
    const queryParams = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.queryParams
    );
    const selectedRows = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.selectedRows
    );
    const metadata = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.metadata
    );
    const isLoading = useSelector(
        ({ AdvisoryListStore }) => AdvisoryListStore.isLoading
    );
    const rows = React.useMemo(
        () => createAdvisoriesRows(advisories, expandedRows, selectedRows),
        [advisories, expandedRows, selectedRows]
    );

    React.useEffect(() => {
        dispatch(fetchApplicableAdvisories(queryParams));
    }, [queryParams]);

    const onCollapse = React.useCallback((_, rowId, value) =>
        dispatch(
            expandAdvisoryRow({
                rowId: getRowIdByIndexExpandable(advisories, rowId),
                value
            })
        )
    );

    const onSelect = React.useCallback((_, value, rowId) =>
        dispatch(
            selectAdvisoryRow({
                rowId: getRowIdByIndexExpandable(advisories, rowId),
                value
            })
        )
    );

    const onSort = useSortColumn(advisoriesColumns, apply, 2);

    const onSetPage = useSetPage(metadata.limit, apply);
    const onPerPageSelect = usePerPageSelect(apply);

    function apply(params) {
        dispatch(changeAdvisoryListParams(params));
    }

    return (
        <React.Fragment>
            <Header title={'System Patching'} showTabs />
            <Main>
                <AdvisoriesTable
                    columns={advisoriesColumns}
                    rows={rows}
                    metadata={metadata}
                    onCollapse={onCollapse}
                    onSelect={onSelect}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    onSort={onSort}
                    isLoading={isLoading}
                />
            </Main>
        </React.Fragment>
    );
};

export default Advisories;
