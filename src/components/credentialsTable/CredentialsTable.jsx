import React, { useMemo, useState } from 'react';
import Table from '../Table';
import Searchbar from '../forms/Searchbar';
import { useCredentials } from '../../api/queries';

const CredentialsTable = ({ isNavbarOpen }) => {
	const [searchbarValue, setSearchbarValue] = useState('');
	const [searchFilter, setSearchFilter] = useState('_id');

	/* =======================
            DATA FETCHING
       ======================= */

	const { data, fetchNextPage, hasNextPage, isFetching, isFetched } = useCredentials(searchbarValue, searchFilter);

	const flatData = useMemo(() => {
		return data?.pages?.flatMap((page) => page.documents) ?? [];
	}, [data]);

	const tableColumns = [
		{
			header: 'Credential Number',
			accessorKey: '_id',
		},
		{
			header: 'Badge Type',
			accessorKey: 'badgeType',
			cell: (info) => {
				const value = info.getValue();
				if (value === 'Employee') return <span className='blue-txt'>{value}</span>;
				if (value === 'Contractor') return <span className='green-txt'>{value}</span>;
				if (value === 'Privileged Visitor') return <span className='purple-txt'>{value}</span>;
				return value;
			},
		},
		{
			header: 'Badge Owner',
			accessorKey: 'badgeOwnerName',
		},
		{
			header: 'Badge Owner ID',
			accessorKey: 'badgeOwnerId',
		},
	];

	/* =======================
              HANDLERS
       ======================= */

	const onChangeSearchSetting = (value) => {
		setSearchFilter(value);
	};

	const handleRowClick = (e, id) => {
		// if double clicked, open editor
		if (e.detail === 2) console.log(id);
	};

	return (
		<div className={'table-page' + (isNavbarOpen ? ' navbar-open' : ' navbar-closed')}>
			<div className='table-header'>
				<h1>Credentials</h1>
				<Searchbar containerClass={'searchbar-container'} setSearchValue={setSearchbarValue} />
				<select name='search' onChange={(e) => onChangeSearchSetting(e.target.value)}>
					<option value='_id'>Credential Number</option>
					<option value='badgeOwnerName'>Badge Owner</option>
					<option value='badgeOwnerId'>Badge Owner ID</option>
				</select>
			</div>
			<div className='table-body'>
				{data ? (
					<Table
						flatData={flatData}
						columns={tableColumns}
						hasNextPage={hasNextPage}
						fetchNextPage={fetchNextPage}
						isFetching={isFetching}
						searchbarValue={searchbarValue}
						handleRowClick={handleRowClick}
					/>
				) : (
					<div className='loader-container'>
						{isFetched ? <h3>No results...</h3> : <div className='loader'></div>}
					</div>
				)}
			</div>
		</div>
	);
};

export default CredentialsTable;
