import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useInfiniteQuery } from 'react-query';
import { useAsyncDebounce } from 'react-table';
import SelectableListItem from './forms/SelectableListItem';
import Searchbar from './forms/Searchbar';

const SelectionListModal = ({ fetchFn, listPropertyKey, initialSelected, saveNewList, closeModal }) => {
	const [searchbarValue, setSearchbarValue] = useState('');
	const [listLength, setListLength] = useState(0);
	const [selectedList, setSelectedList] = useState(initialSelected.sort((a, b) => a._id - b._id));
	const [onlyShowSelected, setOnlyShowSelected] = useState(false);

	const searchParams = useMemo(() => {
		return searchbarValue ? { filter: listPropertyKey, value: searchbarValue } : {};
	}, [searchbarValue, listPropertyKey]);

	// custom component list items, state array that holds selected items

	const { data, fetchNextPage, remove, isFetching, isFetched } = useInfiniteQuery(
		['table-data', searchbarValue],
		async ({ pageParam = 0 }) => {
			const fetchedData = await fetchFn(pageParam, searchParams);
			setListLength(fetchedData.count);

			return fetchedData.documents;
		},
		{
			getNextPageParam: (_lastGroup, groups) => groups.length,
			keepPreviousData: false,
			refetchOnWindowFocus: false,
		}
	);

	const fetchMoreOnBottomReached = (containerRefElement) => {
		if (containerRefElement) {
			const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
			const dataLength = data?.pages?.flat().length;

			if (scrollHeight - scrollTop - clientHeight < 10 && !isFetching && dataLength < listLength) {
				fetchNextPage();
			}
		}
	};

	const itemsList = useMemo(() => {
		return data?.pages?.flat() ?? [];
	}, [data]);

	useEffect(() => {
		return () => {
			// remove infiniteQuery cache on unmount
			remove();
		};
		// eslint-disable-next-line
	}, []);

	const saveSelected = () => {
		saveNewList(selectedList);
		toast.success(<b>Saved!</b>);
		closeModal();
	};

	const onChangeSearchbar = useAsyncDebounce((value) => {
		setSearchbarValue(value);
	}, 300);

	const checkIfSelected = useCallback(
		(item) => {
			return selectedList.map((selectedItem) => selectedItem._id).includes(item._id);
		},
		[selectedList]
	);

	const toggleSelected = useCallback(
		(item) => {
			// either add or remove item from selectedList
			if (checkIfSelected(item))
				setSelectedList(selectedList.filter((selectedListItem) => selectedListItem._id !== item._id));
			else setSelectedList([...selectedList, item].sort((a, b) => a._id - b._id));
		},
		[selectedList, checkIfSelected]
	);

	const listItems = useMemo(() => {
		const listToRender = onlyShowSelected ? selectedList : itemsList;

		return listToRender.map((item) => (
			<SelectableListItem
				key={item._id}
				item={item}
				label={item[listPropertyKey]}
				defaultChecked={checkIfSelected(item)}
				toggleSelected={toggleSelected}
			/>
		));
	}, [itemsList, listPropertyKey, selectedList, onlyShowSelected, checkIfSelected, toggleSelected]);

	return (
		<>
			<div className='header'>
				<h2>Access Groups</h2>
				<button className='btn-exit' onClick={() => closeModal()}>
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>
			<div className='body'>
				<Searchbar
					containerClass={'searchbar-container'}
					onChange={onChangeSearchbar}
					setClear={setSearchbarValue}
					autoFocus={true}
				/>
				<div className='list' onScroll={(e) => fetchMoreOnBottomReached(e.target)}>
					{itemsList.length === 0 ? (
						<div className='loader-container'>
							{isFetched ? <h3>No results...</h3> : <div className='loader'></div>}
						</div>
					) : (
						listItems
					)}
				</div>
			</div>

			<div className='footer'>
				<div className='show-selected' onClick={() => setOnlyShowSelected(!onlyShowSelected)}>
					{onlyShowSelected ? <FontAwesomeIcon icon={faSquareCheck} /> : <FontAwesomeIcon icon={faSquare} />}
					<span>Show selected</span>
				</div>
				<button className='btn cancel' onClick={() => closeModal()}>
					Cancel
				</button>
				<button className='btn save' onClick={() => saveSelected()}>
					Save
				</button>
			</div>
		</>
	);
};

export default SelectionListModal;
