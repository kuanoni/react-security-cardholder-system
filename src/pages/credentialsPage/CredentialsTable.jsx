import '../../styles/TablePage.scss';

import React, { useMemo, useState } from 'react';

import Searchbar from '../../components/forms/Searchbar';
import Table from '../../components/Table';
import { useCredentials } from '../../helpers/api/queries';

const CredentialsTable = ({ isNavbarOpen }) => {
	const [searchbarValue, setSearchbarValue] = useState('');
	const [searchFilter, setSearchFilter] = useState('_id');
	const [sorting, setSorting] = useState([]);

	const query = useCredentials(
		{ value: searchbarValue, filter: searchFilter },
		sorting.length ? { by: sorting[0].id, order: sorting[0].desc ? 'desc' : 'asc' } : { by: '', order: '' }
	);

	const tableColumns = useMemo(
		() => [
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
		],
		[]
	);

	/* =======================
              HANDLERS
       ======================= */

	const handleRowClick = (e, id) => {
		// if double clicked, open editor
		if (e.detail === 2) console.log(id);
	};

	return (
		<div className={'table-page' + (isNavbarOpen ? ' navbar-open' : ' navbar-closed')}>
			<div className='table-header'>
				<h1>Credentials</h1>
				<Searchbar containerClass={'searchbar-container'} setSearchValue={setSearchbarValue} />
				<select name='search' onChange={(e) => setSearchFilter(e.target.value)}>
					<option value='_id'>Credential Number</option>
					<option value='badgeType'>Badge Type</option>
					<option value='badgeOwnerName'>Badge Owner</option>
					<option value='badgeOwnerId'>Badge Owner ID</option>
				</select>
			</div>
			<div className='table-body'>
				<Table
					query={query}
					columns={tableColumns}
					sorting={sorting}
					setSorting={setSorting}
					handleRowClick={handleRowClick}
				/>
			</div>
		</div>
	);
};

export default CredentialsTable;
