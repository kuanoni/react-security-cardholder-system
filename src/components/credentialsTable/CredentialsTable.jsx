import React, { useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useAsyncDebounce } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchCredentials } from '../../api/fetch';
import Table from '../Table';

const CredentialsTable = () => {
	const [searchbarValue, setSearchbarValue] = useState('');
	const [searchFilter, setSearchFilter] = useState('badgeNumber');
	const [credentialsCount, setCredentialsCount] = useState('firstName');

	const searchbarRef = useRef(null);

	const searchUrlString = useMemo(() => {
		return searchbarValue ? `?${searchFilter}=${searchbarValue}` : '';
	}, [searchbarValue, searchFilter]);

	const { data, fetchNextPage, remove, isFetching, isFetched } = useInfiniteQuery(
		['table-data', searchbarValue, searchbarValue && searchFilter],
		async ({ pageParam = 0 }) => {
			const fetchedData = await fetchCredentials(pageParam, searchUrlString);
			setCredentialsCount(fetchedData.count);

			if (searchbarValue) {
				return fetchedData.data.sort((a, b) => (a[searchFilter] < b[searchFilter] ? -1 : 1));
			}

			return fetchedData.data;
		},
		{
			getNextPageParam: (_lastGroup, groups) => groups.length,
			keepPreviousData: false,
			refetchOnWindowFocus: false,
		}
	);

	const flatData = useMemo(() => {
		return data?.pages?.flat() ?? [];
	}, [data]);

	const fetchMoreOnBottomReached = (containerRef) => {
		if (containerRef) {
			const { scrollHeight, scrollTop, clientHeight } = containerRef;

			if (scrollHeight - scrollTop - clientHeight < 10 && !isFetching && flatData.length < credentialsCount) {
				fetchNextPage();
			}
		}
	};

	const tableColumns = [
		{
			Header: 'ID',
			accessor: 'id',
		},
		{
			Header: 'Credential Number',
			accessor: 'badgeNumber',
		},
		{
			Header: 'Credential Type',
			accessor: 'badgeType',
			Cell: ({ value }) => {
				if (value === 'Employee') return <span className='blue-txt'>{value}</span>;
				if (value === 'Contractor') return <span className='green-txt'>{value}</span>;
				if (value === 'Privileged Visitor') return <span className='purple-txt'>{value}</span>;
				return value;
			},
		},
		{
			Header: 'Credential Owner',
			accessor: 'badgeOwnerName',
		},
	];

	const onChangeSearchbar = useAsyncDebounce((value) => {
		setSearchbarValue(value);
		remove(); // clear infiniteQuery data cache on search
	}, 500);

	const onChangeSearchSetting = (value) => {
		setSearchFilter(value);
	};

	const handleRowClick = (e, id) => {
		// if double clicked, open editor
		// if (e.detail === 2) console.log(id);
	};

	return (
		<div className='credentials-page'>
			<div className='table-searchbar'>
				<h1>Credentials</h1>
				<div className='searchbar-input-container'>
					{searchbarValue && (
						<button
							className='btn-close'
							onClick={() => {
								setSearchbarValue('');
								searchbarRef.current.value = '';
							}}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					)}
					<input
						type='text'
						placeholder='Search...'
						ref={searchbarRef}
						onChange={(e) => onChangeSearchbar(e.target.value)}
					/>
				</div>
				<select name='search' onChange={(e) => onChangeSearchSetting(e.target.value)}>
					<option value='badgeNumber'>Credential Number</option>
					<option value='badgeOwnerName'>Credential Owner</option>
				</select>
			</div>
			<div className='credentials-section-container'>
				<div className='table-container' onScroll={(e) => fetchMoreOnBottomReached(e.target)}>
					{Object.keys(flatData).length ? (
						<Table data={flatData} columns={tableColumns} handleRowClick={handleRowClick} />
					) : (
						<div className='loader-container'>
							{isFetched ? <h3>No results...</h3> : <div className='loader'></div>}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CredentialsTable;
