
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen$1(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen$1(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/DarkModeToggle.svelte generated by Svelte v3.44.3 */

    const file$a = "src/DarkModeToggle.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$a, 20, 4, 518);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-7 w-7 text-link");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$a, 14, 2, 382);
    			attr_dev(div, "class", "fixed top-5 right-5 cursor-pointer group print:hidden");
    			add_location(div, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DarkModeToggle', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DarkModeToggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = function () {
    		let htmlClasses = document.querySelector("html").classList;

    		if (localStorage.theme == "dark") {
    			htmlClasses.remove("dark");
    			localStorage.removeItem("theme");
    		} else {
    			htmlClasses.add("dark");
    			localStorage.theme = "dark";
    		}
    	};

    	return [click_handler];
    }

    class DarkModeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DarkModeToggle",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Info.svelte generated by Svelte v3.44.3 */

    const file$9 = "src/Info.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*name*/ ctx[0]}`;
    			t1 = space();
    			p = element("p");
    			p.textContent = `${/*about*/ ctx[1]}`;
    			attr_dev(h1, "class", "text-4xl text-center text-vivid");
    			add_location(h1, file$9, 7, 2, 259);
    			attr_dev(p, "class", "text-vivid leading-tight text-justify");
    			add_location(p, file$9, 8, 2, 318);
    			attr_dev(div, "class", "space-y-5");
    			add_location(div, file$9, 6, 0, 232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	let name = "Madhavan Raja";
    	let about = "Hi! I'm a software engineer, full-stack developer, competitive programmer and a research enthusiast. I am interested in Deep Learning and Computer Vision.";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ name, about });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('about' in $$props) $$invalidate(1, about = $$props.about);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, about];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Publications/PublicationsCard.svelte generated by Svelte v3.44.3 */

    const file$8 = "src/Publications/PublicationsCard.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let span;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(/*authors*/ ctx[1]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*journal*/ ctx[2]);
    			t5 = space();
    			span = element("span");
    			t6 = text(/*link*/ ctx[3]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$8, 9, 4, 172);
    			attr_dev(p0, "class", "text-sm text-vivid group-hover:text-link inline-block table");
    			add_location(p0, file$8, 14, 4, 297);
    			attr_dev(p1, "class", "text-sm text-muted group-hover:text-link inline-block table");
    			add_location(p1, file$8, 17, 4, 401);
    			attr_dev(span, "class", "text-link hidden print:block");
    			add_location(span, file$8, 20, 4, 505);
    			attr_dev(a, "href", /*link*/ ctx[3]);
    			add_location(a, file$8, 8, 2, 151);
    			attr_dev(div, "class", "group inline-block table");
    			add_location(div, file$8, 7, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p0);
    			append_dev(p0, t2);
    			append_dev(a, t3);
    			append_dev(a, p1);
    			append_dev(p1, t4);
    			append_dev(a, t5);
    			append_dev(a, span);
    			append_dev(span, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*authors*/ 2) set_data_dev(t2, /*authors*/ ctx[1]);
    			if (dirty & /*journal*/ 4) set_data_dev(t4, /*journal*/ ctx[2]);
    			if (dirty & /*link*/ 8) set_data_dev(t6, /*link*/ ctx[3]);

    			if (dirty & /*link*/ 8) {
    				attr_dev(a, "href", /*link*/ ctx[3]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PublicationsCard', slots, []);
    	let { name } = $$props;
    	let { authors } = $$props;
    	let { journal } = $$props;
    	let { link } = $$props;
    	const writable_props = ['name', 'authors', 'journal', 'link'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PublicationsCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('authors' in $$props) $$invalidate(1, authors = $$props.authors);
    		if ('journal' in $$props) $$invalidate(2, journal = $$props.journal);
    		if ('link' in $$props) $$invalidate(3, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({ name, authors, journal, link });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('authors' in $$props) $$invalidate(1, authors = $$props.authors);
    		if ('journal' in $$props) $$invalidate(2, journal = $$props.journal);
    		if ('link' in $$props) $$invalidate(3, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, authors, journal, link];
    }

    class PublicationsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0, authors: 1, journal: 2, link: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PublicationsCard",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'name'");
    		}

    		if (/*authors*/ ctx[1] === undefined && !('authors' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'authors'");
    		}

    		if (/*journal*/ ctx[2] === undefined && !('journal' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'journal'");
    		}

    		if (/*link*/ ctx[3] === undefined && !('link' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'link'");
    		}
    	}

    	get name() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get authors() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set authors(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get journal() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set journal(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    function isFunction(x) {
        return typeof x === 'function';
    }
    var isFunction_2 = isFunction;


    var isFunction_1$1 = /*#__PURE__*/Object.defineProperty({
    	isFunction: isFunction_2
    }, '__esModule', {value: true});

    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config_1$1 = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = new Error();
                console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            else if (_enable_super_gross_mode_that_will_cause_bad_things) {
                console.log('RxJS: Back to a better error behavior. Thank you. <3');
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };


    var config$1 = /*#__PURE__*/Object.defineProperty({
    	config: config_1$1
    }, '__esModule', {value: true});

    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }
    var hostReportError_2 = hostReportError;


    var hostReportError_1$1 = /*#__PURE__*/Object.defineProperty({
    	hostReportError: hostReportError_2
    }, '__esModule', {value: true});

    var config_1 = config$1;

    var hostReportError_1 = hostReportError_1$1;

    var empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config_1.config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError_1.hostReportError(err);
            }
        },
        complete: function () { }
    };


    var Observer = /*#__PURE__*/Object.defineProperty({
    	empty: empty
    }, '__esModule', {value: true});

    var isArray_1$1 = (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();


    var isArray$1 = /*#__PURE__*/Object.defineProperty({
    	isArray: isArray_1$1
    }, '__esModule', {value: true});

    function isObject(x) {
        return x !== null && typeof x === 'object';
    }
    var isObject_2 = isObject;


    var isObject_1$1 = /*#__PURE__*/Object.defineProperty({
    	isObject: isObject_2
    }, '__esModule', {value: true});

    var UnsubscriptionErrorImpl = (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    var UnsubscriptionError_1$1 = UnsubscriptionErrorImpl;


    var UnsubscriptionError = /*#__PURE__*/Object.defineProperty({
    	UnsubscriptionError: UnsubscriptionError_1$1
    }, '__esModule', {value: true});

    var isArray_1 = isArray$1;

    var isObject_1 = isObject_1$1;

    var isFunction_1 = isFunction_1$1;

    var UnsubscriptionError_1 = UnsubscriptionError;

    var Subscription = (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._ctorUnsubscribe = true;
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction_1.isFunction(_unsubscribe)) {
                if (_ctorUnsubscribe) {
                    this._unsubscribe = undefined;
                }
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError_1.UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray_1.isArray(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject_1.isObject(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError_1.UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError_1.UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    var Subscription_2 = Subscription;
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError_1.UnsubscriptionError) ? err.errors : err); }, []);
    }


    var Subscription_1$1 = /*#__PURE__*/Object.defineProperty({
    	Subscription: Subscription_2
    }, '__esModule', {value: true});

    var rxSubscriber = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rxSubscriber = (function () {
        return typeof Symbol === 'function'
            ? Symbol('rxSubscriber')
            : '@@rxSubscriber_' + Math.random();
    })();
    exports.$$rxSubscriber = exports.rxSubscriber;

    });

    var Observer_1 = Observer;

    var Subscription_1 = Subscription_1$1;

    var rxSubscriber_1 = rxSubscriber;

    var __extends$2 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();







    var Subscriber = (function (_super) {
        __extends$2(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = Observer_1.empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = Observer_1.empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription_1.Subscription));
    var Subscriber_2 = Subscriber;
    var SafeSubscriber = (function (_super) {
        __extends$2(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction_1.isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== Observer_1.empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction_1.isFunction(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config_1.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config_1.config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError_1.hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError_1.hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config_1.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config_1.config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError_1.hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config_1.config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config_1.config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError_1.hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));
    var SafeSubscriber_1 = SafeSubscriber;


    var Subscriber_1$1 = /*#__PURE__*/Object.defineProperty({
    	Subscriber: Subscriber_2,
    	SafeSubscriber: SafeSubscriber_1
    }, '__esModule', {value: true});

    var Subscriber_1 = Subscriber_1$1;

    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber_1.Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }
    var canReportError_2 = canReportError;


    var canReportError_1$1 = /*#__PURE__*/Object.defineProperty({
    	canReportError: canReportError_2
    }, '__esModule', {value: true});

    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber_1.Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {
                return nextOrObserver[rxSubscriber_1.rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber_1.Subscriber(Observer_1.empty);
        }
        return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
    }
    var toSubscriber_2 = toSubscriber;


    var toSubscriber_1$1 = /*#__PURE__*/Object.defineProperty({
    	toSubscriber: toSubscriber_2
    }, '__esModule', {value: true});

    var observable_1$1 = (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();


    var observable$2 = /*#__PURE__*/Object.defineProperty({
    	observable: observable_1$1
    }, '__esModule', {value: true});

    function identity(x) {
        return x;
    }
    var identity_2 = identity;


    var identity_1$1 = /*#__PURE__*/Object.defineProperty({
    	identity: identity_2
    }, '__esModule', {value: true});

    var identity_1 = identity_1$1;

    function pipe() {
        var fns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fns[_i] = arguments[_i];
        }
        return pipeFromArray(fns);
    }
    var pipe_2 = pipe;
    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity_1.identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }
    var pipeFromArray_1 = pipeFromArray;


    var pipe_1$1 = /*#__PURE__*/Object.defineProperty({
    	pipe: pipe_2,
    	pipeFromArray: pipeFromArray_1
    }, '__esModule', {value: true});

    var canReportError_1 = canReportError_1$1;

    var toSubscriber_1 = toSubscriber_1$1;

    var observable_1 = observable$2;

    var pipe_1 = pipe_1$1;

    var Observable$4 = (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config_1.config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config_1.config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config_1.config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError_1.canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable_1.observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipe_1.pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    var Observable_2 = Observable$4;
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config_1.config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }


    var Observable_1 = /*#__PURE__*/Object.defineProperty({
    	Observable: Observable_2
    }, '__esModule', {value: true});

    var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    function filter$4(predicate, thisArg) {
        return function filterOperatorFunction(source) {
            return source.lift(new FilterOperator(predicate, thisArg));
        };
    }
    var filter_2 = filter$4;
    var FilterOperator = (function () {
        function FilterOperator(predicate, thisArg) {
            this.predicate = predicate;
            this.thisArg = thisArg;
        }
        FilterOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
        };
        return FilterOperator;
    }());
    var FilterSubscriber = (function (_super) {
        __extends$1(FilterSubscriber, _super);
        function FilterSubscriber(destination, predicate, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.predicate = predicate;
            _this.thisArg = thisArg;
            _this.count = 0;
            return _this;
        }
        FilterSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.predicate.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            if (result) {
                this.destination.next(value);
            }
        };
        return FilterSubscriber;
    }(Subscriber_1.Subscriber));


    var filter_1 = /*#__PURE__*/Object.defineProperty({
    	filter: filter_2
    }, '__esModule', {value: true});

    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    function map$4(project, thisArg) {
        return function mapOperation(source) {
            if (typeof project !== 'function') {
                throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
            }
            return source.lift(new MapOperator(project, thisArg));
        };
    }
    var map_2 = map$4;
    var MapOperator = (function () {
        function MapOperator(project, thisArg) {
            this.project = project;
            this.thisArg = thisArg;
        }
        MapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
        };
        return MapOperator;
    }());
    var MapOperator_1 = MapOperator;
    var MapSubscriber = (function (_super) {
        __extends(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber_1.Subscriber));


    var map_1 = /*#__PURE__*/Object.defineProperty({
    	map: map_2,
    	MapOperator: MapOperator_1
    }, '__esModule', {value: true});

    var _require = Observable_1;

    var _require2 = filter_1;

    var _require3 = map_1;

    //  Since `@sanity/client` doesn't offer ESM exports (yet) const {filter} = require('rxjs/operators') will cause the the whole of rxjs to be included in the bundle.
    //  The internal import paths here is a stop-gap measure and will become less of a problem when @sanity/client export tree-shakeable esm bundles
    var Observable$3 = _require.Observable;

    var filter$3 = _require2.filter;

    var map$3 = _require3.map;

    var observable$1 = {
      Observable: Observable$3,
      filter: filter$3,
      map: map$3
    };

    var getSelection = function getSelection(sel) {
      if (typeof sel === 'string' || Array.isArray(sel)) {
        return {
          id: sel
        };
      }

      if (sel && sel.query) {
        return 'params' in sel ? {
          query: sel.query,
          params: sel.params
        } : {
          query: sel.query
        };
      }

      var selectionOpts = ['* Document ID (<docId>)', '* Array of document IDs', '* Object containing `query`'].join('\n');
      throw new Error("Unknown selection - must be one of:\n\n".concat(selectionOpts));
    };

    var validators = createCommonjsModule(function (module, exports) {

    function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

    var VALID_ASSET_TYPES = ['image', 'file'];
    var VALID_INSERT_LOCATIONS = ['before', 'after', 'replace'];

    exports.dataset = function (name) {
      if (!/^(~[a-z0-9]{1}[-\w]{0,63}|[a-z0-9]{1}[-\w]{0,63})$/.test(name)) {
        throw new Error('Datasets can only contain lowercase characters, numbers, underscores and dashes, and start with tilde, and be maximum 64 characters');
      }
    };

    exports.projectId = function (id) {
      if (!/^[-a-z0-9]+$/i.test(id)) {
        throw new Error('`projectId` can only contain only a-z, 0-9 and dashes');
      }
    };

    exports.validateAssetType = function (type) {
      if (VALID_ASSET_TYPES.indexOf(type) === -1) {
        throw new Error("Invalid asset type: ".concat(type, ". Must be one of ").concat(VALID_ASSET_TYPES.join(', ')));
      }
    };

    exports.validateObject = function (op, val) {
      if (val === null || _typeof(val) !== 'object' || Array.isArray(val)) {
        throw new Error("".concat(op, "() takes an object of properties"));
      }
    };

    exports.requireDocumentId = function (op, doc) {
      if (!doc._id) {
        throw new Error("".concat(op, "() requires that the document contains an ID (\"_id\" property)"));
      }

      exports.validateDocumentId(op, doc._id);
    };

    exports.validateDocumentId = function (op, id) {
      if (typeof id !== 'string' || !/^[a-z0-9_.-]+$/i.test(id)) {
        throw new Error("".concat(op, "(): \"").concat(id, "\" is not a valid document ID"));
      }
    };

    exports.validateInsert = function (at, selector, items) {
      var signature = 'insert(at, selector, items)';

      if (VALID_INSERT_LOCATIONS.indexOf(at) === -1) {
        var valid = VALID_INSERT_LOCATIONS.map(function (loc) {
          return "\"".concat(loc, "\"");
        }).join(', ');
        throw new Error("".concat(signature, " takes an \"at\"-argument which is one of: ").concat(valid));
      }

      if (typeof selector !== 'string') {
        throw new Error("".concat(signature, " takes a \"selector\"-argument which must be a string"));
      }

      if (!Array.isArray(items)) {
        throw new Error("".concat(signature, " takes an \"items\"-argument which must be an array"));
      }
    };

    exports.hasDataset = function (config) {
      if (!config.dataset) {
        throw new Error('`dataset` must be provided to perform queries');
      }

      return config.dataset || '';
    };

    exports.requestTag = function (tag) {
      if (typeof tag !== 'string' || !/^[a-z0-9._-]{1,75}$/i.test(tag)) {
        throw new Error("Tag can only contain alphanumeric characters, underscores, dashes and dots, and be between one and 75 characters long.");
      }

      return tag;
    };
    });

    function _defineProperty$4(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







    var validateObject = validators.validateObject;
    var validateInsert = validators.validateInsert;

    function Patch(selection) {
      var operations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var client = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      this.selection = selection;
      this.operations = objectAssign({}, operations);
      this.client = client;
    }

    objectAssign(Patch.prototype, {
      clone: function clone() {
        return new Patch(this.selection, objectAssign({}, this.operations), this.client);
      },
      set: function set(props) {
        return this._assign('set', props);
      },
      diffMatchPatch: function diffMatchPatch(props) {
        validateObject('diffMatchPatch', props);
        return this._assign('diffMatchPatch', props);
      },
      unset: function unset(attrs) {
        if (!Array.isArray(attrs)) {
          throw new Error('unset(attrs) takes an array of attributes to unset, non-array given');
        }

        this.operations = objectAssign({}, this.operations, {
          unset: attrs
        });
        return this;
      },
      setIfMissing: function setIfMissing(props) {
        return this._assign('setIfMissing', props);
      },
      replace: function replace(props) {
        validateObject('replace', props);
        return this._set('set', {
          $: props
        }); // eslint-disable-line id-length
      },
      inc: function inc(props) {
        return this._assign('inc', props);
      },
      dec: function dec(props) {
        return this._assign('dec', props);
      },
      insert: function insert(at, selector, items) {
        var _this$_assign;

        validateInsert(at, selector, items);
        return this._assign('insert', (_this$_assign = {}, _defineProperty$4(_this$_assign, at, selector), _defineProperty$4(_this$_assign, "items", items), _this$_assign));
      },
      append: function append(selector, items) {
        return this.insert('after', "".concat(selector, "[-1]"), items);
      },
      prepend: function prepend(selector, items) {
        return this.insert('before', "".concat(selector, "[0]"), items);
      },
      splice: function splice(selector, start, deleteCount, items) {
        // Negative indexes doesn't mean the same in Sanity as they do in JS;
        // -1 means "actually at the end of the array", which allows inserting
        // at the end of the array without knowing its length. We therefore have
        // to substract negative indexes by one to match JS. If you want Sanity-
        // behaviour, just use `insert('replace', selector, items)` directly
        var delAll = typeof deleteCount === 'undefined' || deleteCount === -1;
        var startIndex = start < 0 ? start - 1 : start;
        var delCount = delAll ? -1 : Math.max(0, start + deleteCount);
        var delRange = startIndex < 0 && delCount >= 0 ? '' : delCount;
        var rangeSelector = "".concat(selector, "[").concat(startIndex, ":").concat(delRange, "]");
        return this.insert('replace', rangeSelector, items || []);
      },
      ifRevisionId: function ifRevisionId(rev) {
        this.operations.ifRevisionID = rev;
        return this;
      },
      serialize: function serialize() {
        return objectAssign(getSelection(this.selection), this.operations);
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this.client) {
          throw new Error('No `client` passed to patch, either provide one or pass the ' + 'patch to a clients `mutate()` method');
        }

        var returnFirst = typeof this.selection === 'string';
        var opts = objectAssign({
          returnFirst: returnFirst,
          returnDocuments: true
        }, options);
        return this.client.mutate({
          patch: this.serialize()
        }, opts);
      },
      reset: function reset() {
        this.operations = {};
        return this;
      },
      _set: function _set(op, props) {
        return this._assign(op, props, false);
      },
      _assign: function _assign(op, props) {
        var merge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        validateObject(op, props);
        this.operations = objectAssign({}, this.operations, _defineProperty$4({}, op, objectAssign({}, merge && this.operations[op] || {}, props)));
        return this;
      }
    });
    var patch = Patch;

    function _defineProperty$3(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







    var defaultMutateOptions = {
      returnDocuments: false
    };

    function Transaction() {
      var operations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var client = arguments.length > 1 ? arguments[1] : undefined;
      var transactionId = arguments.length > 2 ? arguments[2] : undefined;
      this.trxId = transactionId;
      this.operations = operations;
      this.client = client;
    }

    objectAssign(Transaction.prototype, {
      clone: function clone() {
        return new Transaction(this.operations.slice(0), this.client, this.trxId);
      },
      create: function create(doc) {
        validators.validateObject('create', doc);
        return this._add({
          create: doc
        });
      },
      createIfNotExists: function createIfNotExists(doc) {
        var op = 'createIfNotExists';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$3({}, op, doc));
      },
      createOrReplace: function createOrReplace(doc) {
        var op = 'createOrReplace';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$3({}, op, doc));
      },
      delete: function _delete(documentId) {
        validators.validateDocumentId('delete', documentId);
        return this._add({
          delete: {
            id: documentId
          }
        });
      },
      patch: function patch$1(documentId, patchOps) {
        var isBuilder = typeof patchOps === 'function';
        var isPatch = documentId instanceof patch; // transaction.patch(client.patch('documentId').inc({visits: 1}))

        if (isPatch) {
          return this._add({
            patch: documentId.serialize()
          });
        } // patch => patch.inc({visits: 1}).set({foo: 'bar'})


        if (isBuilder) {
          var patch$1 = patchOps(new patch(documentId, {}, this.client));

          if (!(patch$1 instanceof patch)) {
            throw new Error('function passed to `patch()` must return the patch');
          }

          return this._add({
            patch: patch$1.serialize()
          });
        }

        return this._add({
          patch: objectAssign({
            id: documentId
          }, patchOps)
        });
      },
      transactionId: function transactionId(id) {
        if (!id) {
          return this.trxId;
        }

        this.trxId = id;
        return this;
      },
      serialize: function serialize() {
        return this.operations.slice();
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit(options) {
        if (!this.client) {
          throw new Error('No `client` passed to transaction, either provide one or pass the ' + 'transaction to a clients `mutate()` method');
        }

        return this.client.mutate(this.serialize(), objectAssign({
          transactionId: this.trxId
        }, defaultMutateOptions, options || {}));
      },
      reset: function reset() {
        this.operations = [];
        return this;
      },
      _add: function _add(mut) {
        this.operations.push(mut);
        return this;
      }
    });
    var transaction = Transaction;

    var _excluded = ["tag"];

    function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

    var enc = encodeURIComponent;

    var encodeQueryString = function (_ref) {
      var query = _ref.query,
          _ref$params = _ref.params,
          params = _ref$params === void 0 ? {} : _ref$params,
          _ref$options = _ref.options,
          options = _ref$options === void 0 ? {} : _ref$options;

      // We generally want tag at the start of the query string
      var tag = options.tag,
          opts = _objectWithoutProperties(options, _excluded);

      var q = "query=".concat(enc(query));
      var base = tag ? "?tag=".concat(enc(tag), "&").concat(q) : "?".concat(q);
      var qString = Object.keys(params).reduce(function (qs, param) {
        return "".concat(qs, "&").concat(enc("$".concat(param)), "=").concat(enc(JSON.stringify(params[param])));
      }, base);
      return Object.keys(opts).reduce(function (qs, option) {
        // Only include the option if it is truthy
        return options[option] ? "".concat(qs, "&").concat(enc(option), "=").concat(enc(options[option])) : qs;
      }, qString);
    };

    /** @license
     * eventsource.js
     * Available under MIT License (MIT)
     * https://github.com/Yaffle/EventSource/
     */

    var eventsource = createCommonjsModule(function (module, exports) {
    /*jslint indent: 2, vars: true, plusplus: true */
    /*global setTimeout, clearTimeout */

    (function (global) {

      var setTimeout = global.setTimeout;
      var clearTimeout = global.clearTimeout;
      var XMLHttpRequest = global.XMLHttpRequest;
      var XDomainRequest = global.XDomainRequest;
      var ActiveXObject = global.ActiveXObject;
      var NativeEventSource = global.EventSource;

      var document = global.document;
      var Promise = global.Promise;
      var fetch = global.fetch;
      var Response = global.Response;
      var TextDecoder = global.TextDecoder;
      var TextEncoder = global.TextEncoder;
      var AbortController = global.AbortController;

      if (typeof window !== "undefined" && typeof document !== "undefined" && !("readyState" in document) && document.body == null) { // Firefox 2
        document.readyState = "loading";
        window.addEventListener("load", function (event) {
          document.readyState = "complete";
        }, false);
      }

      if (XMLHttpRequest == null && ActiveXObject != null) { // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest_in_IE6
        XMLHttpRequest = function () {
          return new ActiveXObject("Microsoft.XMLHTTP");
        };
      }

      if (Object.create == undefined) {
        Object.create = function (C) {
          function F(){}
          F.prototype = C;
          return new F();
        };
      }

      if (!Date.now) {
        Date.now = function now() {
          return new Date().getTime();
        };
      }

      // see #118 (Promise#finally with polyfilled Promise)
      // see #123 (data URLs crash Edge)
      // see #125 (CSP violations)
      // see pull/#138
      // => No way to polyfill Promise#finally

      if (AbortController == undefined) {
        var originalFetch2 = fetch;
        fetch = function (url, options) {
          var signal = options.signal;
          return originalFetch2(url, {headers: options.headers, credentials: options.credentials, cache: options.cache}).then(function (response) {
            var reader = response.body.getReader();
            signal._reader = reader;
            if (signal._aborted) {
              signal._reader.cancel();
            }
            return {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              body: {
                getReader: function () {
                  return reader;
                }
              }
            };
          });
        };
        AbortController = function () {
          this.signal = {
            _reader: null,
            _aborted: false
          };
          this.abort = function () {
            if (this.signal._reader != null) {
              this.signal._reader.cancel();
            }
            this.signal._aborted = true;
          };
        };
      }

      function TextDecoderPolyfill() {
        this.bitsNeeded = 0;
        this.codePoint = 0;
      }

      TextDecoderPolyfill.prototype.decode = function (octets) {
        function valid(codePoint, shift, octetsCount) {
          if (octetsCount === 1) {
            return codePoint >= 0x0080 >> shift && codePoint << shift <= 0x07FF;
          }
          if (octetsCount === 2) {
            return codePoint >= 0x0800 >> shift && codePoint << shift <= 0xD7FF || codePoint >= 0xE000 >> shift && codePoint << shift <= 0xFFFF;
          }
          if (octetsCount === 3) {
            return codePoint >= 0x010000 >> shift && codePoint << shift <= 0x10FFFF;
          }
          throw new Error();
        }
        function octetsCount(bitsNeeded, codePoint) {
          if (bitsNeeded === 6 * 1) {
            return codePoint >> 6 > 15 ? 3 : codePoint > 31 ? 2 : 1;
          }
          if (bitsNeeded === 6 * 2) {
            return codePoint > 15 ? 3 : 2;
          }
          if (bitsNeeded === 6 * 3) {
            return 3;
          }
          throw new Error();
        }
        var REPLACER = 0xFFFD;
        var string = "";
        var bitsNeeded = this.bitsNeeded;
        var codePoint = this.codePoint;
        for (var i = 0; i < octets.length; i += 1) {
          var octet = octets[i];
          if (bitsNeeded !== 0) {
            if (octet < 128 || octet > 191 || !valid(codePoint << 6 | octet & 63, bitsNeeded - 6, octetsCount(bitsNeeded, codePoint))) {
              bitsNeeded = 0;
              codePoint = REPLACER;
              string += String.fromCharCode(codePoint);
            }
          }
          if (bitsNeeded === 0) {
            if (octet >= 0 && octet <= 127) {
              bitsNeeded = 0;
              codePoint = octet;
            } else if (octet >= 192 && octet <= 223) {
              bitsNeeded = 6 * 1;
              codePoint = octet & 31;
            } else if (octet >= 224 && octet <= 239) {
              bitsNeeded = 6 * 2;
              codePoint = octet & 15;
            } else if (octet >= 240 && octet <= 247) {
              bitsNeeded = 6 * 3;
              codePoint = octet & 7;
            } else {
              bitsNeeded = 0;
              codePoint = REPLACER;
            }
            if (bitsNeeded !== 0 && !valid(codePoint, bitsNeeded, octetsCount(bitsNeeded, codePoint))) {
              bitsNeeded = 0;
              codePoint = REPLACER;
            }
          } else {
            bitsNeeded -= 6;
            codePoint = codePoint << 6 | octet & 63;
          }
          if (bitsNeeded === 0) {
            if (codePoint <= 0xFFFF) {
              string += String.fromCharCode(codePoint);
            } else {
              string += String.fromCharCode(0xD800 + (codePoint - 0xFFFF - 1 >> 10));
              string += String.fromCharCode(0xDC00 + (codePoint - 0xFFFF - 1 & 0x3FF));
            }
          }
        }
        this.bitsNeeded = bitsNeeded;
        this.codePoint = codePoint;
        return string;
      };

      // Firefox < 38 throws an error with stream option
      var supportsStreamOption = function () {
        try {
          return new TextDecoder().decode(new TextEncoder().encode("test"), {stream: true}) === "test";
        } catch (error) {
          console.debug("TextDecoder does not support streaming option. Using polyfill instead: " + error);
        }
        return false;
      };

      // IE, Edge
      if (TextDecoder == undefined || TextEncoder == undefined || !supportsStreamOption()) {
        TextDecoder = TextDecoderPolyfill;
      }

      var k = function () {
      };

      function XHRWrapper(xhr) {
        this.withCredentials = false;
        this.readyState = 0;
        this.status = 0;
        this.statusText = "";
        this.responseText = "";
        this.onprogress = k;
        this.onload = k;
        this.onerror = k;
        this.onreadystatechange = k;
        this._contentType = "";
        this._xhr = xhr;
        this._sendTimeout = 0;
        this._abort = k;
      }

      XHRWrapper.prototype.open = function (method, url) {
        this._abort(true);

        var that = this;
        var xhr = this._xhr;
        var state = 1;
        var timeout = 0;

        this._abort = function (silent) {
          if (that._sendTimeout !== 0) {
            clearTimeout(that._sendTimeout);
            that._sendTimeout = 0;
          }
          if (state === 1 || state === 2 || state === 3) {
            state = 4;
            xhr.onload = k;
            xhr.onerror = k;
            xhr.onabort = k;
            xhr.onprogress = k;
            xhr.onreadystatechange = k;
            // IE 8 - 9: XDomainRequest#abort() does not fire any event
            // Opera < 10: XMLHttpRequest#abort() does not fire any event
            xhr.abort();
            if (timeout !== 0) {
              clearTimeout(timeout);
              timeout = 0;
            }
            if (!silent) {
              that.readyState = 4;
              that.onabort(null);
              that.onreadystatechange();
            }
          }
          state = 0;
        };

        var onStart = function () {
          if (state === 1) {
            //state = 2;
            var status = 0;
            var statusText = "";
            var contentType = undefined;
            if (!("contentType" in xhr)) {
              try {
                status = xhr.status;
                statusText = xhr.statusText;
                contentType = xhr.getResponseHeader("Content-Type");
              } catch (error) {
                // IE < 10 throws exception for `xhr.status` when xhr.readyState === 2 || xhr.readyState === 3
                // Opera < 11 throws exception for `xhr.status` when xhr.readyState === 2
                // https://bugs.webkit.org/show_bug.cgi?id=29121
                status = 0;
                statusText = "";
                contentType = undefined;
                // Firefox < 14, Chrome ?, Safari ?
                // https://bugs.webkit.org/show_bug.cgi?id=29658
                // https://bugs.webkit.org/show_bug.cgi?id=77854
              }
            } else {
              status = 200;
              statusText = "OK";
              contentType = xhr.contentType;
            }
            if (status !== 0) {
              state = 2;
              that.readyState = 2;
              that.status = status;
              that.statusText = statusText;
              that._contentType = contentType;
              that.onreadystatechange();
            }
          }
        };
        var onProgress = function () {
          onStart();
          if (state === 2 || state === 3) {
            state = 3;
            var responseText = "";
            try {
              responseText = xhr.responseText;
            } catch (error) {
              // IE 8 - 9 with XMLHttpRequest
            }
            that.readyState = 3;
            that.responseText = responseText;
            that.onprogress();
          }
        };
        var onFinish = function (type, event) {
          if (event == null || event.preventDefault == null) {
            event = {
              preventDefault: k
            };
          }
          // Firefox 52 fires "readystatechange" (xhr.readyState === 4) without final "readystatechange" (xhr.readyState === 3)
          // IE 8 fires "onload" without "onprogress"
          onProgress();
          if (state === 1 || state === 2 || state === 3) {
            state = 4;
            if (timeout !== 0) {
              clearTimeout(timeout);
              timeout = 0;
            }
            that.readyState = 4;
            if (type === "load") {
              that.onload(event);
            } else if (type === "error") {
              that.onerror(event);
            } else if (type === "abort") {
              that.onabort(event);
            } else {
              throw new TypeError();
            }
            that.onreadystatechange();
          }
        };
        var onReadyStateChange = function (event) {
          if (xhr != undefined) { // Opera 12
            if (xhr.readyState === 4) {
              if (!("onload" in xhr) || !("onerror" in xhr) || !("onabort" in xhr)) {
                onFinish(xhr.responseText === "" ? "error" : "load", event);
              }
            } else if (xhr.readyState === 3) {
              if (!("onprogress" in xhr)) { // testing XMLHttpRequest#responseText too many times is too slow in IE 11
                // and in Firefox 3.6
                onProgress();
              }
            } else if (xhr.readyState === 2) {
              onStart();
            }
          }
        };
        var onTimeout = function () {
          timeout = setTimeout(function () {
            onTimeout();
          }, 500);
          if (xhr.readyState === 3) {
            onProgress();
          }
        };

        // XDomainRequest#abort removes onprogress, onerror, onload
        if ("onload" in xhr) {
          xhr.onload = function (event) {
            onFinish("load", event);
          };
        }
        if ("onerror" in xhr) {
          xhr.onerror = function (event) {
            onFinish("error", event);
          };
        }
        // improper fix to match Firefox behaviour, but it is better than just ignore abort
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=768596
        // https://bugzilla.mozilla.org/show_bug.cgi?id=880200
        // https://code.google.com/p/chromium/issues/detail?id=153570
        // IE 8 fires "onload" without "onprogress
        if ("onabort" in xhr) {
          xhr.onabort = function (event) {
            onFinish("abort", event);
          };
        }

        if ("onprogress" in xhr) {
          xhr.onprogress = onProgress;
        }

        // IE 8 - 9 (XMLHTTPRequest)
        // Opera < 12
        // Firefox < 3.5
        // Firefox 3.5 - 3.6 - ? < 9.0
        // onprogress is not fired sometimes or delayed
        // see also #64 (significant lag in IE 11)
        if ("onreadystatechange" in xhr) {
          xhr.onreadystatechange = function (event) {
            onReadyStateChange(event);
          };
        }

        if ("contentType" in xhr || !("ontimeout" in XMLHttpRequest.prototype)) {
          url += (url.indexOf("?") === -1 ? "?" : "&") + "padding=true";
        }
        xhr.open(method, url, true);

        if ("readyState" in xhr) {
          // workaround for Opera 12 issue with "progress" events
          // #91 (XMLHttpRequest onprogress not fired for streaming response in Edge 14-15-?)
          timeout = setTimeout(function () {
            onTimeout();
          }, 0);
        }
      };
      XHRWrapper.prototype.abort = function () {
        this._abort(false);
      };
      XHRWrapper.prototype.getResponseHeader = function (name) {
        return this._contentType;
      };
      XHRWrapper.prototype.setRequestHeader = function (name, value) {
        var xhr = this._xhr;
        if ("setRequestHeader" in xhr) {
          xhr.setRequestHeader(name, value);
        }
      };
      XHRWrapper.prototype.getAllResponseHeaders = function () {
        // XMLHttpRequest#getAllResponseHeaders returns null for CORS requests in Firefox 3.6.28
        return this._xhr.getAllResponseHeaders != undefined ? this._xhr.getAllResponseHeaders() || "" : "";
      };
      XHRWrapper.prototype.send = function () {
        // loading indicator in Safari < ? (6), Chrome < 14, Firefox
        // https://bugzilla.mozilla.org/show_bug.cgi?id=736723
        if ((!("ontimeout" in XMLHttpRequest.prototype) || (!("sendAsBinary" in XMLHttpRequest.prototype) && !("mozAnon" in XMLHttpRequest.prototype))) &&
            document != undefined &&
            document.readyState != undefined &&
            document.readyState !== "complete") {
          var that = this;
          that._sendTimeout = setTimeout(function () {
            that._sendTimeout = 0;
            that.send();
          }, 4);
          return;
        }

        var xhr = this._xhr;
        // withCredentials should be set after "open" for Safari and Chrome (< 19 ?)
        if ("withCredentials" in xhr) {
          xhr.withCredentials = this.withCredentials;
        }
        try {
          // xhr.send(); throws "Not enough arguments" in Firefox 3.0
          xhr.send(undefined);
        } catch (error1) {
          // Safari 5.1.7, Opera 12
          throw error1;
        }
      };

      function toLowerCase(name) {
        return name.replace(/[A-Z]/g, function (c) {
          return String.fromCharCode(c.charCodeAt(0) + 0x20);
        });
      }

      function HeadersPolyfill(all) {
        // Get headers: implemented according to mozilla's example code: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders#Example
        var map = Object.create(null);
        var array = all.split("\r\n");
        for (var i = 0; i < array.length; i += 1) {
          var line = array[i];
          var parts = line.split(": ");
          var name = parts.shift();
          var value = parts.join(": ");
          map[toLowerCase(name)] = value;
        }
        this._map = map;
      }
      HeadersPolyfill.prototype.get = function (name) {
        return this._map[toLowerCase(name)];
      };

      if (XMLHttpRequest != null && XMLHttpRequest.HEADERS_RECEIVED == null) { // IE < 9, Firefox 3.6
        XMLHttpRequest.HEADERS_RECEIVED = 2;
      }

      function XHRTransport() {
      }

      XHRTransport.prototype.open = function (xhr, onStartCallback, onProgressCallback, onFinishCallback, url, withCredentials, headers) {
        xhr.open("GET", url);
        var offset = 0;
        xhr.onprogress = function () {
          var responseText = xhr.responseText;
          var chunk = responseText.slice(offset);
          offset += chunk.length;
          onProgressCallback(chunk);
        };
        xhr.onerror = function (event) {
          event.preventDefault();
          onFinishCallback(new Error("NetworkError"));
        };
        xhr.onload = function () {
          onFinishCallback(null);
        };
        xhr.onabort = function () {
          onFinishCallback(null);
        };
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            var status = xhr.status;
            var statusText = xhr.statusText;
            var contentType = xhr.getResponseHeader("Content-Type");
            var headers = xhr.getAllResponseHeaders();
            onStartCallback(status, statusText, contentType, new HeadersPolyfill(headers));
          }
        };
        xhr.withCredentials = withCredentials;
        for (var name in headers) {
          if (Object.prototype.hasOwnProperty.call(headers, name)) {
            xhr.setRequestHeader(name, headers[name]);
          }
        }
        xhr.send();
        return xhr;
      };

      function HeadersWrapper(headers) {
        this._headers = headers;
      }
      HeadersWrapper.prototype.get = function (name) {
        return this._headers.get(name);
      };

      function FetchTransport() {
      }

      FetchTransport.prototype.open = function (xhr, onStartCallback, onProgressCallback, onFinishCallback, url, withCredentials, headers) {
        var reader = null;
        var controller = new AbortController();
        var signal = controller.signal;
        var textDecoder = new TextDecoder();
        fetch(url, {
          headers: headers,
          credentials: withCredentials ? "include" : "same-origin",
          signal: signal,
          cache: "no-store"
        }).then(function (response) {
          reader = response.body.getReader();
          onStartCallback(response.status, response.statusText, response.headers.get("Content-Type"), new HeadersWrapper(response.headers));
          // see https://github.com/promises-aplus/promises-spec/issues/179
          return new Promise(function (resolve, reject) {
            var readNextChunk = function () {
              reader.read().then(function (result) {
                if (result.done) {
                  //Note: bytes in textDecoder are ignored
                  resolve(undefined);
                } else {
                  var chunk = textDecoder.decode(result.value, {stream: true});
                  onProgressCallback(chunk);
                  readNextChunk();
                }
              })["catch"](function (error) {
                reject(error);
              });
            };
            readNextChunk();
          });
        })["catch"](function (error) {
          if (error.name === "AbortError") {
            return undefined;
          } else {
            return error;
          }
        }).then(function (error) {
          onFinishCallback(error);
        });
        return {
          abort: function () {
            if (reader != null) {
              reader.cancel(); // https://bugzilla.mozilla.org/show_bug.cgi?id=1583815
            }
            controller.abort();
          }
        };
      };

      function EventTarget() {
        this._listeners = Object.create(null);
      }

      function throwError(e) {
        setTimeout(function () {
          throw e;
        }, 0);
      }

      EventTarget.prototype.dispatchEvent = function (event) {
        event.target = this;
        var typeListeners = this._listeners[event.type];
        if (typeListeners != undefined) {
          var length = typeListeners.length;
          for (var i = 0; i < length; i += 1) {
            var listener = typeListeners[i];
            try {
              if (typeof listener.handleEvent === "function") {
                listener.handleEvent(event);
              } else {
                listener.call(this, event);
              }
            } catch (e) {
              throwError(e);
            }
          }
        }
      };
      EventTarget.prototype.addEventListener = function (type, listener) {
        type = String(type);
        var listeners = this._listeners;
        var typeListeners = listeners[type];
        if (typeListeners == undefined) {
          typeListeners = [];
          listeners[type] = typeListeners;
        }
        var found = false;
        for (var i = 0; i < typeListeners.length; i += 1) {
          if (typeListeners[i] === listener) {
            found = true;
          }
        }
        if (!found) {
          typeListeners.push(listener);
        }
      };
      EventTarget.prototype.removeEventListener = function (type, listener) {
        type = String(type);
        var listeners = this._listeners;
        var typeListeners = listeners[type];
        if (typeListeners != undefined) {
          var filtered = [];
          for (var i = 0; i < typeListeners.length; i += 1) {
            if (typeListeners[i] !== listener) {
              filtered.push(typeListeners[i]);
            }
          }
          if (filtered.length === 0) {
            delete listeners[type];
          } else {
            listeners[type] = filtered;
          }
        }
      };

      function Event(type) {
        this.type = type;
        this.target = undefined;
      }

      function MessageEvent(type, options) {
        Event.call(this, type);
        this.data = options.data;
        this.lastEventId = options.lastEventId;
      }

      MessageEvent.prototype = Object.create(Event.prototype);

      function ConnectionEvent(type, options) {
        Event.call(this, type);
        this.status = options.status;
        this.statusText = options.statusText;
        this.headers = options.headers;
      }

      ConnectionEvent.prototype = Object.create(Event.prototype);

      function ErrorEvent(type, options) {
        Event.call(this, type);
        this.error = options.error;
      }

      ErrorEvent.prototype = Object.create(Event.prototype);

      var WAITING = -1;
      var CONNECTING = 0;
      var OPEN = 1;
      var CLOSED = 2;

      var AFTER_CR = -1;
      var FIELD_START = 0;
      var FIELD = 1;
      var VALUE_START = 2;
      var VALUE = 3;

      var contentTypeRegExp = /^text\/event\-stream(;.*)?$/i;

      var MINIMUM_DURATION = 1000;
      var MAXIMUM_DURATION = 18000000;

      var parseDuration = function (value, def) {
        var n = value == null ? def : parseInt(value, 10);
        if (n !== n) {
          n = def;
        }
        return clampDuration(n);
      };
      var clampDuration = function (n) {
        return Math.min(Math.max(n, MINIMUM_DURATION), MAXIMUM_DURATION);
      };

      var fire = function (that, f, event) {
        try {
          if (typeof f === "function") {
            f.call(that, event);
          }
        } catch (e) {
          throwError(e);
        }
      };

      function EventSourcePolyfill(url, options) {
        EventTarget.call(this);
        options = options || {};

        this.onopen = undefined;
        this.onmessage = undefined;
        this.onerror = undefined;

        this.url = undefined;
        this.readyState = undefined;
        this.withCredentials = undefined;
        this.headers = undefined;

        this._close = undefined;

        start(this, url, options);
      }

      function getBestXHRTransport() {
        return (XMLHttpRequest != undefined && ("withCredentials" in XMLHttpRequest.prototype)) || XDomainRequest == undefined
            ? new XMLHttpRequest()
            : new XDomainRequest();
      }

      var isFetchSupported = fetch != undefined && Response != undefined && "body" in Response.prototype;

      function start(es, url, options) {
        url = String(url);
        var withCredentials = Boolean(options.withCredentials);
        var lastEventIdQueryParameterName = options.lastEventIdQueryParameterName || "lastEventId";

        var initialRetry = clampDuration(1000);
        var heartbeatTimeout = parseDuration(options.heartbeatTimeout, 45000);

        var lastEventId = "";
        var retry = initialRetry;
        var wasActivity = false;
        var textLength = 0;
        var headers = options.headers || {};
        var TransportOption = options.Transport;
        var xhr = isFetchSupported && TransportOption == undefined ? undefined : new XHRWrapper(TransportOption != undefined ? new TransportOption() : getBestXHRTransport());
        var transport = TransportOption != null && typeof TransportOption !== "string" ? new TransportOption() : (xhr == undefined ? new FetchTransport() : new XHRTransport());
        var abortController = undefined;
        var timeout = 0;
        var currentState = WAITING;
        var dataBuffer = "";
        var lastEventIdBuffer = "";
        var eventTypeBuffer = "";

        var textBuffer = "";
        var state = FIELD_START;
        var fieldStart = 0;
        var valueStart = 0;

        var onStart = function (status, statusText, contentType, headers) {
          if (currentState === CONNECTING) {
            if (status === 200 && contentType != undefined && contentTypeRegExp.test(contentType)) {
              currentState = OPEN;
              wasActivity = Date.now();
              retry = initialRetry;
              es.readyState = OPEN;
              var event = new ConnectionEvent("open", {
                status: status,
                statusText: statusText,
                headers: headers
              });
              es.dispatchEvent(event);
              fire(es, es.onopen, event);
            } else {
              var message = "";
              if (status !== 200) {
                if (statusText) {
                  statusText = statusText.replace(/\s+/g, " ");
                }
                message = "EventSource's response has a status " + status + " " + statusText + " that is not 200. Aborting the connection.";
              } else {
                message = "EventSource's response has a Content-Type specifying an unsupported type: " + (contentType == undefined ? "-" : contentType.replace(/\s+/g, " ")) + ". Aborting the connection.";
              }
              close();
              var event = new ConnectionEvent("error", {
                status: status,
                statusText: statusText,
                headers: headers
              });
              es.dispatchEvent(event);
              fire(es, es.onerror, event);
              console.error(message);
            }
          }
        };

        var onProgress = function (textChunk) {
          if (currentState === OPEN) {
            var n = -1;
            for (var i = 0; i < textChunk.length; i += 1) {
              var c = textChunk.charCodeAt(i);
              if (c === "\n".charCodeAt(0) || c === "\r".charCodeAt(0)) {
                n = i;
              }
            }
            var chunk = (n !== -1 ? textBuffer : "") + textChunk.slice(0, n + 1);
            textBuffer = (n === -1 ? textBuffer : "") + textChunk.slice(n + 1);
            if (textChunk !== "") {
              wasActivity = Date.now();
              textLength += textChunk.length;
            }
            for (var position = 0; position < chunk.length; position += 1) {
              var c = chunk.charCodeAt(position);
              if (state === AFTER_CR && c === "\n".charCodeAt(0)) {
                state = FIELD_START;
              } else {
                if (state === AFTER_CR) {
                  state = FIELD_START;
                }
                if (c === "\r".charCodeAt(0) || c === "\n".charCodeAt(0)) {
                  if (state !== FIELD_START) {
                    if (state === FIELD) {
                      valueStart = position + 1;
                    }
                    var field = chunk.slice(fieldStart, valueStart - 1);
                    var value = chunk.slice(valueStart + (valueStart < position && chunk.charCodeAt(valueStart) === " ".charCodeAt(0) ? 1 : 0), position);
                    if (field === "data") {
                      dataBuffer += "\n";
                      dataBuffer += value;
                    } else if (field === "id") {
                      lastEventIdBuffer = value;
                    } else if (field === "event") {
                      eventTypeBuffer = value;
                    } else if (field === "retry") {
                      initialRetry = parseDuration(value, initialRetry);
                      retry = initialRetry;
                    } else if (field === "heartbeatTimeout") {
                      heartbeatTimeout = parseDuration(value, heartbeatTimeout);
                      if (timeout !== 0) {
                        clearTimeout(timeout);
                        timeout = setTimeout(function () {
                          onTimeout();
                        }, heartbeatTimeout);
                      }
                    }
                  }
                  if (state === FIELD_START) {
                    if (dataBuffer !== "") {
                      lastEventId = lastEventIdBuffer;
                      if (eventTypeBuffer === "") {
                        eventTypeBuffer = "message";
                      }
                      var event = new MessageEvent(eventTypeBuffer, {
                        data: dataBuffer.slice(1),
                        lastEventId: lastEventIdBuffer
                      });
                      es.dispatchEvent(event);
                      if (eventTypeBuffer === "open") {
                        fire(es, es.onopen, event);
                      } else if (eventTypeBuffer === "message") {
                        fire(es, es.onmessage, event);
                      } else if (eventTypeBuffer === "error") {
                        fire(es, es.onerror, event);
                      }
                      if (currentState === CLOSED) {
                        return;
                      }
                    }
                    dataBuffer = "";
                    eventTypeBuffer = "";
                  }
                  state = c === "\r".charCodeAt(0) ? AFTER_CR : FIELD_START;
                } else {
                  if (state === FIELD_START) {
                    fieldStart = position;
                    state = FIELD;
                  }
                  if (state === FIELD) {
                    if (c === ":".charCodeAt(0)) {
                      valueStart = position + 1;
                      state = VALUE_START;
                    }
                  } else if (state === VALUE_START) {
                    state = VALUE;
                  }
                }
              }
            }
          }
        };

        var onFinish = function (error) {
          if (currentState === OPEN || currentState === CONNECTING) {
            currentState = WAITING;
            if (timeout !== 0) {
              clearTimeout(timeout);
              timeout = 0;
            }
            timeout = setTimeout(function () {
              onTimeout();
            }, retry);
            retry = clampDuration(Math.min(initialRetry * 16, retry * 2));

            es.readyState = CONNECTING;
            var event = new ErrorEvent("error", {error: error});
            es.dispatchEvent(event);
            fire(es, es.onerror, event);
            if (error != undefined) {
              console.error(error);
            }
          }
        };

        var close = function () {
          currentState = CLOSED;
          if (abortController != undefined) {
            abortController.abort();
            abortController = undefined;
          }
          if (timeout !== 0) {
            clearTimeout(timeout);
            timeout = 0;
          }
          es.readyState = CLOSED;
        };

        var onTimeout = function () {
          timeout = 0;

          if (currentState !== WAITING) {
            if (!wasActivity && abortController != undefined) {
              onFinish(new Error("No activity within " + heartbeatTimeout + " milliseconds." + " " + (currentState === CONNECTING ? "No response received." : textLength + " chars received.") + " " + "Reconnecting."));
              if (abortController != undefined) {
                abortController.abort();
                abortController = undefined;
              }
            } else {
              var nextHeartbeat = Math.max((wasActivity || Date.now()) + heartbeatTimeout - Date.now(), 1);
              wasActivity = false;
              timeout = setTimeout(function () {
                onTimeout();
              }, nextHeartbeat);
            }
            return;
          }

          wasActivity = false;
          textLength = 0;
          timeout = setTimeout(function () {
            onTimeout();
          }, heartbeatTimeout);

          currentState = CONNECTING;
          dataBuffer = "";
          eventTypeBuffer = "";
          lastEventIdBuffer = lastEventId;
          textBuffer = "";
          fieldStart = 0;
          valueStart = 0;
          state = FIELD_START;

          // https://bugzilla.mozilla.org/show_bug.cgi?id=428916
          // Request header field Last-Event-ID is not allowed by Access-Control-Allow-Headers.
          var requestURL = url;
          if (url.slice(0, 5) !== "data:" && url.slice(0, 5) !== "blob:") {
            if (lastEventId !== "") {
              // Remove the lastEventId parameter if it's already part of the request URL.
              var i = url.indexOf("?");
              requestURL = i === -1 ? url : url.slice(0, i + 1) + url.slice(i + 1).replace(/(?:^|&)([^=&]*)(?:=[^&]*)?/g, function (p, paramName) {
                return paramName === lastEventIdQueryParameterName ? '' : p;
              });
              // Append the current lastEventId to the request URL.
              requestURL += (url.indexOf("?") === -1 ? "?" : "&") + lastEventIdQueryParameterName +"=" + encodeURIComponent(lastEventId);
            }
          }
          var withCredentials = es.withCredentials;
          var requestHeaders = {};
          requestHeaders["Accept"] = "text/event-stream";
          var headers = es.headers;
          if (headers != undefined) {
            for (var name in headers) {
              if (Object.prototype.hasOwnProperty.call(headers, name)) {
                requestHeaders[name] = headers[name];
              }
            }
          }
          try {
            abortController = transport.open(xhr, onStart, onProgress, onFinish, requestURL, withCredentials, requestHeaders);
          } catch (error) {
            close();
            throw error;
          }
        };

        es.url = url;
        es.readyState = CONNECTING;
        es.withCredentials = withCredentials;
        es.headers = headers;
        es._close = close;

        onTimeout();
      }

      EventSourcePolyfill.prototype = Object.create(EventTarget.prototype);
      EventSourcePolyfill.prototype.CONNECTING = CONNECTING;
      EventSourcePolyfill.prototype.OPEN = OPEN;
      EventSourcePolyfill.prototype.CLOSED = CLOSED;
      EventSourcePolyfill.prototype.close = function () {
        this._close();
      };

      EventSourcePolyfill.CONNECTING = CONNECTING;
      EventSourcePolyfill.OPEN = OPEN;
      EventSourcePolyfill.CLOSED = CLOSED;
      EventSourcePolyfill.prototype.withCredentials = undefined;

      var R = NativeEventSource;
      if (XMLHttpRequest != undefined && (NativeEventSource == undefined || !("withCredentials" in NativeEventSource.prototype))) {
        // Why replace a native EventSource ?
        // https://bugzilla.mozilla.org/show_bug.cgi?id=444328
        // https://bugzilla.mozilla.org/show_bug.cgi?id=831392
        // https://code.google.com/p/chromium/issues/detail?id=260144
        // https://code.google.com/p/chromium/issues/detail?id=225654
        // ...
        R = EventSourcePolyfill;
      }

      (function (factory) {
        {
          var v = factory(exports);
          if (v !== undefined) module.exports = v;
        }
      })(function (exports) {
        exports.EventSourcePolyfill = EventSourcePolyfill;
        exports.NativeEventSource = NativeEventSource;
        exports.EventSource = R;
      });
    }(typeof globalThis === 'undefined' ? (typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : commonjsGlobal) : globalThis));
    });

    /* eslint-disable no-var */

    var browser = eventsource.EventSourcePolyfill;

    var pick = function (obj, props) {
      return props.reduce(function (selection, prop) {
        if (typeof obj[prop] === 'undefined') {
          return selection;
        }

        selection[prop] = obj[prop];
        return selection;
      }, {});
    };

    var defaults = function (obj, defaults) {
      return Object.keys(defaults).concat(Object.keys(obj)).reduce(function (target, prop) {
        target[prop] = typeof obj[prop] === 'undefined' ? defaults[prop] : obj[prop];
        return target;
      }, {});
    };

    function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

    function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty$2(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

    function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



    var Observable$2 = observable$1.Observable;







     // Limit is 16K for a _request_, eg including headers. Have to account for an
    // unknown range of headers, but an average EventSource request from Chrome seems
    // to have around 700 bytes of cruft, so let us account for 1.2K to be "safe"


    var MAX_URL_LENGTH = 16000 - 1200;
    var EventSource = browser;
    var possibleOptions = ['includePreviousRevision', 'includeResult', 'visibility', 'effectFormat', 'tag'];
    var defaultOptions$1 = {
      includeResult: true
    };

    var listen = function listen(query, params) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _this$clientConfig = this.clientConfig,
          url = _this$clientConfig.url,
          token = _this$clientConfig.token,
          withCredentials = _this$clientConfig.withCredentials,
          requestTagPrefix = _this$clientConfig.requestTagPrefix;
      var tag = opts.tag && requestTagPrefix ? [requestTagPrefix, opts.tag].join('.') : opts.tag;

      var options = _objectSpread$1(_objectSpread$1({}, defaults(opts, defaultOptions$1)), {}, {
        tag: tag
      });

      var listenOpts = pick(options, possibleOptions);
      var qs = encodeQueryString({
        query: query,
        params: params,
        options: listenOpts,
        tag: tag
      });
      var uri = "".concat(url).concat(this.getDataUrl('listen', qs));

      if (uri.length > MAX_URL_LENGTH) {
        return new Observable$2(function (observer) {
          return observer.error(new Error('Query too large for listener'));
        });
      }

      var listenFor = options.events ? options.events : ['mutation'];
      var shouldEmitReconnect = listenFor.indexOf('reconnect') !== -1;
      var esOptions = {};

      if (token || withCredentials) {
        esOptions.withCredentials = true;
      }

      if (token) {
        esOptions.headers = {
          Authorization: "Bearer ".concat(token)
        };
      }

      return new Observable$2(function (observer) {
        var es = getEventSource();
        var reconnectTimer;
        var stopped = false;

        function onError() {
          if (stopped) {
            return;
          }

          emitReconnect(); // Allow event handlers of `emitReconnect` to cancel/close the reconnect attempt

          if (stopped) {
            return;
          } // Unless we've explicitly stopped the ES (in which case `stopped` should be true),
          // we should never be in a disconnected state. By default, EventSource will reconnect
          // automatically, in which case it sets readyState to `CONNECTING`, but in some cases
          // (like when a laptop lid is closed), it closes the connection. In these cases we need
          // to explicitly reconnect.


          if (es.readyState === EventSource.CLOSED) {
            unsubscribe();
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(open, 100);
          }
        }

        function onChannelError(err) {
          observer.error(cooerceError(err));
        }

        function onMessage(evt) {
          var event = parseEvent(evt);
          return event instanceof Error ? observer.error(event) : observer.next(event);
        }

        function onDisconnect(evt) {
          stopped = true;
          unsubscribe();
          observer.complete();
        }

        function unsubscribe() {
          es.removeEventListener('error', onError, false);
          es.removeEventListener('channelError', onChannelError, false);
          es.removeEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return es.removeEventListener(type, onMessage, false);
          });
          es.close();
        }

        function emitReconnect() {
          if (shouldEmitReconnect) {
            observer.next({
              type: 'reconnect'
            });
          }
        }

        function getEventSource() {
          var evs = new EventSource(uri, esOptions);
          evs.addEventListener('error', onError, false);
          evs.addEventListener('channelError', onChannelError, false);
          evs.addEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return evs.addEventListener(type, onMessage, false);
          });
          return evs;
        }

        function open() {
          es = getEventSource();
        }

        function stop() {
          stopped = true;
          unsubscribe();
        }

        return stop;
      });
    };

    function parseEvent(event) {
      try {
        var data = event.data && JSON.parse(event.data) || {};
        return objectAssign({
          type: event.type
        }, data);
      } catch (err) {
        return err;
      }
    }

    function cooerceError(err) {
      if (err instanceof Error) {
        return err;
      }

      var evt = parseEvent(err);
      return evt instanceof Error ? evt : new Error(extractErrorMessage(evt));
    }

    function extractErrorMessage(err) {
      if (!err.error) {
        return err.message || 'Unknown listener error';
      }

      if (err.error.description) {
        return err.error.description;
      }

      return typeof err.error === 'string' ? err.error : JSON.stringify(err.error, null, 2);
    }

    function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



    var map$2 = observable$1.map,
        filter$2 = observable$1.filter;













    var excludeFalsey = function excludeFalsey(param, defValue) {
      var value = typeof param === 'undefined' ? defValue : param;
      return param === false ? undefined : value;
    };

    var getMutationQuery = function getMutationQuery() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        dryRun: options.dryRun,
        returnIds: true,
        returnDocuments: excludeFalsey(options.returnDocuments, true),
        visibility: options.visibility || 'sync',
        autoGenerateArrayKeys: options.autoGenerateArrayKeys,
        skipCrossDatasetReferenceValidation: options.skipCrossDatasetReferenceValidation
      };
    };

    var isResponse = function isResponse(event) {
      return event.type === 'response';
    };

    var getBody = function getBody(event) {
      return event.body;
    };

    var indexBy = function indexBy(docs, attr) {
      return docs.reduce(function (indexed, doc) {
        indexed[attr(doc)] = doc;
        return indexed;
      }, Object.create(null));
    };

    var toPromise$1 = function toPromise(observable) {
      return observable.toPromise();
    };

    var getQuerySizeLimit = 11264;
    var dataMethods = {
      listen: listen,
      getDataUrl: function getDataUrl(operation, path) {
        var config = this.clientConfig;
        var catalog = validators.hasDataset(config);
        var baseUri = "/".concat(operation, "/").concat(catalog);
        var uri = path ? "".concat(baseUri, "/").concat(path) : baseUri;
        return "/data".concat(uri).replace(/\/($|\?)/, '$1');
      },
      fetch: function fetch(query, params) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var mapResponse = options.filterResponse === false ? function (res) {
          return res;
        } : function (res) {
          return res.result;
        };

        var observable = this._dataRequest('query', {
          query: query,
          params: params
        }, options).pipe(map$2(mapResponse));

        return this.isPromiseAPI() ? toPromise$1(observable) : observable;
      },
      getDocument: function getDocument(id) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var options = {
          uri: this.getDataUrl('doc', id),
          json: true,
          tag: opts.tag
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          return event.body.documents && event.body.documents[0];
        }));

        return this.isPromiseAPI() ? toPromise$1(observable) : observable;
      },
      getDocuments: function getDocuments(ids) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var options = {
          uri: this.getDataUrl('doc', ids.join(',')),
          json: true,
          tag: opts.tag
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          var indexed = indexBy(event.body.documents || [], function (doc) {
            return doc._id;
          });
          return ids.map(function (id) {
            return indexed[id] || null;
          });
        }));

        return this.isPromiseAPI() ? toPromise$1(observable) : observable;
      },
      create: function create(doc, options) {
        return this._create(doc, 'create', options);
      },
      createIfNotExists: function createIfNotExists(doc, options) {
        validators.requireDocumentId('createIfNotExists', doc);
        return this._create(doc, 'createIfNotExists', options);
      },
      createOrReplace: function createOrReplace(doc, options) {
        validators.requireDocumentId('createOrReplace', doc);
        return this._create(doc, 'createOrReplace', options);
      },
      patch: function patch$1(selector, operations) {
        return new patch(selector, operations, this);
      },
      delete: function _delete(selection, options) {
        return this.dataRequest('mutate', {
          mutations: [{
            delete: getSelection(selection)
          }]
        }, options);
      },
      mutate: function mutate(mutations, options) {
        var mut = mutations instanceof patch || mutations instanceof transaction ? mutations.serialize() : mutations;
        var muts = Array.isArray(mut) ? mut : [mut];
        var transactionId = options && options.transactionId;
        return this.dataRequest('mutate', {
          mutations: muts,
          transactionId: transactionId
        }, options);
      },
      transaction: function transaction$1(operations) {
        return new transaction(operations, this);
      },
      dataRequest: function dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var request = this._dataRequest(endpoint, body, options);

        return this.isPromiseAPI() ? toPromise$1(request) : request;
      },
      _dataRequest: function _dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var isMutation = endpoint === 'mutate';
        var isQuery = endpoint === 'query'; // Check if the query string is within a configured threshold,
        // in which case we can use GET. Otherwise, use POST.

        var strQuery = !isMutation && encodeQueryString(body);
        var useGet = !isMutation && strQuery.length < getQuerySizeLimit;
        var stringQuery = useGet ? strQuery : '';
        var returnFirst = options.returnFirst;
        var timeout = options.timeout,
            token = options.token,
            tag = options.tag,
            headers = options.headers;
        var uri = this.getDataUrl(endpoint, stringQuery);
        var reqOptions = {
          method: useGet ? 'GET' : 'POST',
          uri: uri,
          json: true,
          body: useGet ? undefined : body,
          query: isMutation && getMutationQuery(options),
          timeout: timeout,
          headers: headers,
          token: token,
          tag: tag,
          canUseCdn: isQuery
        };
        return this._requestObservable(reqOptions).pipe(filter$2(isResponse), map$2(getBody), map$2(function (res) {
          if (!isMutation) {
            return res;
          } // Should we return documents?


          var results = res.results || [];

          if (options.returnDocuments) {
            return returnFirst ? results[0] && results[0].document : results.map(function (mut) {
              return mut.document;
            });
          } // Return a reduced subset


          var key = returnFirst ? 'documentId' : 'documentIds';
          var ids = returnFirst ? results[0] && results[0].id : results.map(function (mut) {
            return mut.id;
          });
          return _defineProperty$1({
            transactionId: res.transactionId,
            results: results
          }, key, ids);
        }));
      },
      _create: function _create(doc, op) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var mutation = _defineProperty$1({}, op, doc);

        var opts = objectAssign({
          returnFirst: true,
          returnDocuments: true
        }, options);
        return this.dataRequest('mutate', {
          mutations: [mutation]
        }, opts);
      }
    };

    function DatasetsClient(client) {
      this.request = client.request.bind(client);
    }

    objectAssign(DatasetsClient.prototype, {
      create: function create(name, options) {
        return this._modify('PUT', name, options);
      },
      edit: function edit(name, options) {
        return this._modify('PATCH', name, options);
      },
      delete: function _delete(name) {
        return this._modify('DELETE', name);
      },
      list: function list() {
        return this.request({
          uri: '/datasets'
        });
      },
      _modify: function _modify(method, name, body) {
        validators.dataset(name);
        return this.request({
          method: method,
          uri: "/datasets/".concat(name),
          body: body
        });
      }
    });
    var datasetsClient = DatasetsClient;

    function ProjectsClient(client) {
      this.client = client;
    }

    objectAssign(ProjectsClient.prototype, {
      list: function list() {
        return this.client.request({
          uri: '/projects'
        });
      },
      getById: function getById(id) {
        return this.client.request({
          uri: "/projects/".concat(id)
        });
      }
    });
    var projectsClient = ProjectsClient;

    var queryString = function (params) {
      var qs = [];

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          qs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])));
        }
      }

      return qs.length > 0 ? "?".concat(qs.join('&')) : '';
    };

    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



    var map$1 = observable$1.map,
        filter$1 = observable$1.filter;





    function AssetsClient(client) {
      this.client = client;
    }

    function optionsFromFile(opts, file) {
      if (typeof window === 'undefined' || !(file instanceof window.File)) {
        return opts;
      }

      return objectAssign({
        filename: opts.preserveFilename === false ? undefined : file.name,
        contentType: file.type
      }, opts);
    }

    objectAssign(AssetsClient.prototype, {
      /**
       * Upload an asset
       *
       * @param  {String} assetType `image` or `file`
       * @param  {File|Blob|Buffer|ReadableStream} body File to upload
       * @param  {Object}  opts Options for the upload
       * @param  {Boolean} opts.preserveFilename Whether or not to preserve the original filename (default: true)
       * @param  {String}  opts.filename Filename for this file (optional)
       * @param  {Number}  opts.timeout  Milliseconds to wait before timing the request out (default: 0)
       * @param  {String}  opts.contentType Mime type of the file
       * @param  {Array}   opts.extract Array of metadata parts to extract from image.
       *                                 Possible values: `location`, `exif`, `image`, `palette`
       * @param  {String}  opts.label Label
       * @param  {String}  opts.title Title
       * @param  {String}  opts.description Description
       * @param  {String}  opts.creditLine The credit to person(s) and/or organization(s) required by the supplier of the image to be used when published
       * @param  {Object}  opts.source Source data (when the asset is from an external service)
       * @param  {String}  opts.source.id The (u)id of the asset within the source, i.e. 'i-f323r1E'
       *                                  Required if source is defined
       * @param  {String}  opts.source.name The name of the source, i.e. 'unsplash'
       *                                  Required if source is defined
       * @param  {String}  opts.source.url A url to where to find the asset, or get more info about it in the source
       *                                  Optional
       * @return {Promise} Resolves with the created asset document
       */
      upload: function upload(assetType, body) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        validators.validateAssetType(assetType); // If an empty array is given, explicitly set `none` to override API defaults

        var meta = opts.extract || undefined;

        if (meta && !meta.length) {
          meta = ['none'];
        }

        var dataset = validators.hasDataset(this.client.clientConfig);
        var assetEndpoint = assetType === 'image' ? 'images' : 'files';
        var options = optionsFromFile(opts, body);
        var tag = options.tag,
            label = options.label,
            title = options.title,
            description = options.description,
            creditLine = options.creditLine,
            filename = options.filename,
            source = options.source;
        var query = {
          label: label,
          title: title,
          description: description,
          filename: filename,
          meta: meta,
          creditLine: creditLine
        };

        if (source) {
          query.sourceId = source.id;
          query.sourceName = source.name;
          query.sourceUrl = source.url;
        }

        var observable = this.client._requestObservable({
          tag: tag,
          method: 'POST',
          timeout: options.timeout || 0,
          uri: "/assets/".concat(assetEndpoint, "/").concat(dataset),
          headers: options.contentType ? {
            'Content-Type': options.contentType
          } : {},
          query: query,
          body: body
        });

        return this.client.isPromiseAPI() ? observable.pipe(filter$1(function (event) {
          return event.type === 'response';
        }), map$1(function (event) {
          return event.body.document;
        })).toPromise() : observable;
      },
      delete: function _delete(type, id) {
        // eslint-disable-next-line no-console
        console.warn('client.assets.delete() is deprecated, please use client.delete(<document-id>)');
        var docId = id || '';

        if (!/^(image|file)-/.test(docId)) {
          docId = "".concat(type, "-").concat(docId);
        } else if (type._id) {
          // We could be passing an entire asset document instead of an ID
          docId = type._id;
        }

        validators.hasDataset(this.client.clientConfig);
        return this.client.delete(docId);
      },
      getImageUrl: function getImageUrl(ref, query) {
        var id = ref._ref || ref;

        if (typeof id !== 'string') {
          throw new Error('getImageUrl() needs either an object with a _ref, or a string with an asset document ID');
        }

        if (!/^image-[A-Za-z0-9_]+-\d+x\d+-[a-z]{1,5}$/.test(id)) {
          throw new Error("Unsupported asset ID \"".concat(id, "\". URL generation only works for auto-generated IDs."));
        }

        var _id$split = id.split('-'),
            _id$split2 = _slicedToArray(_id$split, 4),
            assetId = _id$split2[1],
            size = _id$split2[2],
            format = _id$split2[3];

        validators.hasDataset(this.client.clientConfig);
        var _this$client$clientCo = this.client.clientConfig,
            projectId = _this$client$clientCo.projectId,
            dataset = _this$client$clientCo.dataset;
        var qs = query ? queryString(query) : '';
        return "https://cdn.sanity.io/images/".concat(projectId, "/").concat(dataset, "/").concat(assetId, "-").concat(size, ".").concat(format).concat(qs);
      }
    });
    var assetsClient = AssetsClient;

    function UsersClient(client) {
      this.client = client;
    }

    objectAssign(UsersClient.prototype, {
      getById: function getById(id) {
        return this.client.request({
          uri: "/users/".concat(id)
        });
      }
    });
    var usersClient = UsersClient;

    function AuthClient(client) {
      this.client = client;
    }

    objectAssign(AuthClient.prototype, {
      getLoginProviders: function getLoginProviders() {
        return this.client.request({
          uri: '/auth/providers'
        });
      },
      logout: function logout() {
        return this.client.request({
          uri: '/auth/logout',
          method: 'POST'
        });
      }
    });
    var authClient = AuthClient;

    var nanoPubsub = function Pubsub() {
      var subscribers = [];
      return {
        subscribe: subscribe,
        publish: publish
      }
      function subscribe(subscriber) {
        subscribers.push(subscriber);
        return function unsubscribe() {
          var idx = subscribers.indexOf(subscriber);
          if (idx > -1) {
            subscribers.splice(idx, 1);
          }
        }
      }
      function publish() {
        for (var i = 0; i < subscribers.length; i++) {
          subscribers[i].apply(null, arguments);
        }
      }
    };

    var middlewareReducer = function (middleware) {
      var applyMiddleware = function applyMiddleware(hook, defaultValue) {
        var bailEarly = hook === 'onError';
        var value = defaultValue;

        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        for (var i = 0; i < middleware[hook].length; i++) {
          var handler = middleware[hook][i];
          value = handler.apply(void 0, [value].concat(args));

          if (bailEarly && !value) {
            break;
          }
        }

        return value;
      };

      return applyMiddleware;
    };

    /**
     * Check if we're required to add a port number.
     *
     * @see https://url.spec.whatwg.org/#default-port
     * @param {Number|String} port Port number we need to check
     * @param {String} protocol Protocol we need to check against.
     * @returns {Boolean} Is it a default port for the given protocol
     * @api private
     */
    var requiresPort = function required(port, protocol) {
      protocol = protocol.split(':')[0];
      port = +port;

      if (!port) return false;

      switch (protocol) {
        case 'http':
        case 'ws':
        return port !== 80;

        case 'https':
        case 'wss':
        return port !== 443;

        case 'ftp':
        return port !== 21;

        case 'gopher':
        return port !== 70;

        case 'file':
        return false;
      }

      return port !== 0;
    };

    var has$1 = Object.prototype.hasOwnProperty
      , undef;

    /**
     * Decode a URI encoded string.
     *
     * @param {String} input The URI encoded string.
     * @returns {String|Null} The decoded string.
     * @api private
     */
    function decode(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, ' '));
      } catch (e) {
        return null;
      }
    }

    /**
     * Attempts to encode a given input.
     *
     * @param {String} input The string that needs to be encoded.
     * @returns {String|Null} The encoded string.
     * @api private
     */
    function encode(input) {
      try {
        return encodeURIComponent(input);
      } catch (e) {
        return null;
      }
    }

    /**
     * Simple query string parser.
     *
     * @param {String} query The query string that needs to be parsed.
     * @returns {Object}
     * @api public
     */
    function querystring(query) {
      var parser = /([^=?#&]+)=?([^&]*)/g
        , result = {}
        , part;

      while (part = parser.exec(query)) {
        var key = decode(part[1])
          , value = decode(part[2]);

        //
        // Prevent overriding of existing properties. This ensures that build-in
        // methods like `toString` or __proto__ are not overriden by malicious
        // querystrings.
        //
        // In the case if failed decoding, we want to omit the key/value pairs
        // from the result.
        //
        if (key === null || value === null || key in result) continue;
        result[key] = value;
      }

      return result;
    }

    /**
     * Transform a query string to an object.
     *
     * @param {Object} obj Object that should be transformed.
     * @param {String} prefix Optional prefix.
     * @returns {String}
     * @api public
     */
    function querystringify(obj, prefix) {
      prefix = prefix || '';

      var pairs = []
        , value
        , key;

      //
      // Optionally prefix with a '?' if needed
      //
      if ('string' !== typeof prefix) prefix = '?';

      for (key in obj) {
        if (has$1.call(obj, key)) {
          value = obj[key];

          //
          // Edge cases where we actually want to encode the value to an empty
          // string instead of the stringified value.
          //
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = '';
          }

          key = encode(key);
          value = encode(value);

          //
          // If we failed to encode the strings, we should bail out as we don't
          // want to add invalid strings to the query.
          //
          if (key === null || value === null) continue;
          pairs.push(key +'='+ value);
        }
      }

      return pairs.length ? prefix + pairs.join('&') : '';
    }

    //
    // Expose the module.
    //
    var stringify = querystringify;
    var parse = querystring;

    var querystringify_1 = {
    	stringify: stringify,
    	parse: parse
    };

    var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
      , CRHTLF = /[\n\r\t]/g
      , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
      , port = /:\d+$/
      , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
      , windowsDriveLetter = /^[a-zA-Z]:/;

    /**
     * Remove control characters and whitespace from the beginning of a string.
     *
     * @param {Object|String} str String to trim.
     * @returns {String} A new string representing `str` stripped of control
     *     characters and whitespace from its beginning.
     * @public
     */
    function trimLeft(str) {
      return (str ? str : '').toString().replace(controlOrWhitespace, '');
    }

    /**
     * These are the parse rules for the URL parser, it informs the parser
     * about:
     *
     * 0. The char it Needs to parse, if it's a string it should be done using
     *    indexOf, RegExp using exec and NaN means set as current value.
     * 1. The property we should set when parsing this value.
     * 2. Indication if it's backwards or forward parsing, when set as number it's
     *    the value of extra chars that should be split off.
     * 3. Inherit from location if non existing in the parser.
     * 4. `toLowerCase` the resulting value.
     */
    var rules = [
      ['#', 'hash'],                        // Extract from the back.
      ['?', 'query'],                       // Extract from the back.
      function sanitize(address, url) {     // Sanitize what is left of the address
        return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
      },
      ['/', 'pathname'],                    // Extract from the back.
      ['@', 'auth', 1],                     // Extract from the front.
      [NaN, 'host', undefined, 1, 1],       // Set left over value.
      [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
      [NaN, 'hostname', undefined, 1, 1]    // Set left over.
    ];

    /**
     * These properties should not be copied or inherited from. This is only needed
     * for all non blob URL's as a blob URL does not include a hash, only the
     * origin.
     *
     * @type {Object}
     * @private
     */
    var ignore = { hash: 1, query: 1 };

    /**
     * The location object differs when your code is loaded through a normal page,
     * Worker or through a worker using a blob. And with the blobble begins the
     * trouble as the location object will contain the URL of the blob, not the
     * location of the page where our code is loaded in. The actual origin is
     * encoded in the `pathname` so we can thankfully generate a good "default"
     * location from it so we can generate proper relative URL's again.
     *
     * @param {Object|String} loc Optional default location object.
     * @returns {Object} lolcation object.
     * @public
     */
    function lolcation(loc) {
      var globalVar;

      if (typeof window !== 'undefined') globalVar = window;
      else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
      else if (typeof self !== 'undefined') globalVar = self;
      else globalVar = {};

      var location = globalVar.location || {};
      loc = loc || location;

      var finaldestination = {}
        , type = typeof loc
        , key;

      if ('blob:' === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ('string' === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ('object' === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }

        if (finaldestination.slashes === undefined) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }

      return finaldestination;
    }

    /**
     * Check whether a protocol scheme is special.
     *
     * @param {String} The protocol scheme of the URL
     * @return {Boolean} `true` if the protocol scheme is special, else `false`
     * @private
     */
    function isSpecial(scheme) {
      return (
        scheme === 'file:' ||
        scheme === 'ftp:' ||
        scheme === 'http:' ||
        scheme === 'https:' ||
        scheme === 'ws:' ||
        scheme === 'wss:'
      );
    }

    /**
     * @typedef ProtocolExtract
     * @type Object
     * @property {String} protocol Protocol matched in the URL, in lowercase.
     * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
     * @property {String} rest Rest of the URL that is not part of the protocol.
     */

    /**
     * Extract protocol information from a URL with/without double slash ("//").
     *
     * @param {String} address URL we want to extract from.
     * @param {Object} location
     * @return {ProtocolExtract} Extracted information.
     * @private
     */
    function extractProtocol(address, location) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, '');
      location = location || {};

      var match = protocolre.exec(address);
      var protocol = match[1] ? match[1].toLowerCase() : '';
      var forwardSlashes = !!match[2];
      var otherSlashes = !!match[3];
      var slashesCount = 0;
      var rest;

      if (forwardSlashes) {
        if (otherSlashes) {
          rest = match[2] + match[3] + match[4];
          slashesCount = match[2].length + match[3].length;
        } else {
          rest = match[2] + match[4];
          slashesCount = match[2].length;
        }
      } else {
        if (otherSlashes) {
          rest = match[3] + match[4];
          slashesCount = match[3].length;
        } else {
          rest = match[4];
        }
      }

      if (protocol === 'file:') {
        if (slashesCount >= 2) {
          rest = rest.slice(2);
        }
      } else if (isSpecial(protocol)) {
        rest = match[4];
      } else if (protocol) {
        if (forwardSlashes) {
          rest = rest.slice(2);
        }
      } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
        rest = match[4];
      }

      return {
        protocol: protocol,
        slashes: forwardSlashes || isSpecial(protocol),
        slashesCount: slashesCount,
        rest: rest
      };
    }

    /**
     * Resolve a relative URL pathname against a base URL pathname.
     *
     * @param {String} relative Pathname of the relative URL.
     * @param {String} base Pathname of the base URL.
     * @return {String} Resolved pathname.
     * @private
     */
    function resolve(relative, base) {
      if (relative === '') return base;

      var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
        , i = path.length
        , last = path[i - 1]
        , unshift = false
        , up = 0;

      while (i--) {
        if (path[i] === '.') {
          path.splice(i, 1);
        } else if (path[i] === '..') {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0) unshift = true;
          path.splice(i, 1);
          up--;
        }
      }

      if (unshift) path.unshift('');
      if (last === '.' || last === '..') path.push('');

      return path.join('/');
    }

    /**
     * The actual URL instance. Instead of returning an object we've opted-in to
     * create an actual constructor as it's much more memory efficient and
     * faster and it pleases my OCD.
     *
     * It is worth noting that we should not use `URL` as class name to prevent
     * clashes with the global URL instance that got introduced in browsers.
     *
     * @constructor
     * @param {String} address URL we want to parse.
     * @param {Object|String} [location] Location defaults for relative paths.
     * @param {Boolean|Function} [parser] Parser for the query string.
     * @private
     */
    function Url(address, location, parser) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, '');

      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }

      var relative, extracted, parse, instruction, index, key
        , instructions = rules.slice()
        , type = typeof location
        , url = this
        , i = 0;

      //
      // The following if statements allows this module two have compatibility with
      // 2 different API:
      //
      // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
      //    where the boolean indicates that the query string should also be parsed.
      //
      // 2. The `URL` interface of the browser which accepts a URL, object as
      //    arguments. The supplied object will be used as default values / fall-back
      //    for relative paths.
      //
      if ('object' !== type && 'string' !== type) {
        parser = location;
        location = null;
      }

      if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

      location = lolcation(location);

      //
      // Extract protocol information before running the instructions.
      //
      extracted = extractProtocol(address || '', location);
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || '';
      address = extracted.rest;

      //
      // When the authority component is absent the URL starts with a path
      // component.
      //
      if (
        extracted.protocol === 'file:' && (
          extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
        (!extracted.slashes &&
          (extracted.protocol ||
            extracted.slashesCount < 2 ||
            !isSpecial(url.protocol)))
      ) {
        instructions[3] = [/(.*)/, 'pathname'];
      }

      for (; i < instructions.length; i++) {
        instruction = instructions[i];

        if (typeof instruction === 'function') {
          address = instruction(address, url);
          continue;
        }

        parse = instruction[0];
        key = instruction[1];

        if (parse !== parse) {
          url[key] = address;
        } else if ('string' === typeof parse) {
          index = parse === '@'
            ? address.lastIndexOf(parse)
            : address.indexOf(parse);

          if (~index) {
            if ('number' === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if ((index = parse.exec(address))) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }

        url[key] = url[key] || (
          relative && instruction[3] ? location[key] || '' : ''
        );

        //
        // Hostname, host and protocol should be lowercased so they can be used to
        // create a proper `origin`.
        //
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }

      //
      // Also parse the supplied query string in to an object. If we're supplied
      // with a custom parser as function use that instead of the default build-in
      // parser.
      //
      if (parser) url.query = parser(url.query);

      //
      // If the URL is relative, resolve the pathname against the base URL.
      //
      if (
          relative
        && location.slashes
        && url.pathname.charAt(0) !== '/'
        && (url.pathname !== '' || location.pathname !== '')
      ) {
        url.pathname = resolve(url.pathname, location.pathname);
      }

      //
      // Default to a / for pathname if none exists. This normalizes the URL
      // to always have a /
      //
      if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
        url.pathname = '/' + url.pathname;
      }

      //
      // We should not add port numbers if they are already the default port number
      // for a given protocol. As the host also contains the port number we're going
      // override it with the hostname which contains no port number.
      //
      if (!requiresPort(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = '';
      }

      //
      // Parse down the `auth` for the username and password.
      //
      url.username = url.password = '';

      if (url.auth) {
        index = url.auth.indexOf(':');

        if (~index) {
          url.username = url.auth.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));

          url.password = url.auth.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(url.auth));
        }

        url.auth = url.password ? url.username +':'+ url.password : url.username;
      }

      url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
        ? url.protocol +'//'+ url.host
        : 'null';

      //
      // The href is just the compiled result.
      //
      url.href = url.toString();
    }

    /**
     * This is convenience method for changing properties in the URL instance to
     * insure that they all propagate correctly.
     *
     * @param {String} part          Property we need to adjust.
     * @param {Mixed} value          The newly assigned value.
     * @param {Boolean|Function} fn  When setting the query, it will be the function
     *                               used to parse the query.
     *                               When setting the protocol, double slash will be
     *                               removed from the final url if it is true.
     * @returns {URL} URL instance for chaining.
     * @public
     */
    function set(part, value, fn) {
      var url = this;

      switch (part) {
        case 'query':
          if ('string' === typeof value && value.length) {
            value = (fn || querystringify_1.parse)(value);
          }

          url[part] = value;
          break;

        case 'port':
          url[part] = value;

          if (!requiresPort(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = '';
          } else if (value) {
            url.host = url.hostname +':'+ value;
          }

          break;

        case 'hostname':
          url[part] = value;

          if (url.port) value += ':'+ url.port;
          url.host = value;
          break;

        case 'host':
          url[part] = value;

          if (port.test(value)) {
            value = value.split(':');
            url.port = value.pop();
            url.hostname = value.join(':');
          } else {
            url.hostname = value;
            url.port = '';
          }

          break;

        case 'protocol':
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;

        case 'pathname':
        case 'hash':
          if (value) {
            var char = part === 'pathname' ? '/' : '#';
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;

        case 'username':
        case 'password':
          url[part] = encodeURIComponent(value);
          break;

        case 'auth':
          var index = value.indexOf(':');

          if (~index) {
            url.username = value.slice(0, index);
            url.username = encodeURIComponent(decodeURIComponent(url.username));

            url.password = value.slice(index + 1);
            url.password = encodeURIComponent(decodeURIComponent(url.password));
          } else {
            url.username = encodeURIComponent(decodeURIComponent(value));
          }
      }

      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];

        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }

      url.auth = url.password ? url.username +':'+ url.password : url.username;

      url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
        ? url.protocol +'//'+ url.host
        : 'null';

      url.href = url.toString();

      return url;
    }

    /**
     * Transform the properties back in to a valid and full URL string.
     *
     * @param {Function} stringify Optional query stringify function.
     * @returns {String} Compiled version of the URL.
     * @public
     */
    function toString(stringify) {
      if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

      var query
        , url = this
        , host = url.host
        , protocol = url.protocol;

      if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

      var result =
        protocol +
        ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

      if (url.username) {
        result += url.username;
        if (url.password) result += ':'+ url.password;
        result += '@';
      } else if (url.password) {
        result += ':'+ url.password;
        result += '@';
      } else if (
        url.protocol !== 'file:' &&
        isSpecial(url.protocol) &&
        !host &&
        url.pathname !== '/'
      ) {
        //
        // Add back the empty userinfo, otherwise the original invalid URL
        // might be transformed into a valid one with `url.pathname` as host.
        //
        result += '@';
      }

      //
      // Trailing colon is removed from `url.host` when it is parsed. If it still
      // ends with a colon, then add back the trailing colon that was removed. This
      // prevents an invalid URL from being transformed into a valid one.
      //
      if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
        host += ':';
      }

      result += host + url.pathname;

      query = 'object' === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

      if (url.hash) result += url.hash;

      return result;
    }

    Url.prototype = { set: set, toString: toString };

    //
    // Expose the URL parser and some additional properties that might be useful for
    // others or testing.
    //
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = querystringify_1;

    var urlParse = Url;

    var isReactNative = typeof navigator === 'undefined' ? false : navigator.product === 'ReactNative';
    var has = Object.prototype.hasOwnProperty;
    var defaultOptions = {
      timeout: isReactNative ? 60000 : 120000
    };

    var defaultOptionsProcessor = function (opts) {
      var options = typeof opts === 'string' ? objectAssign({
        url: opts
      }, defaultOptions) : objectAssign({}, defaultOptions, opts); // Parse URL into parts

      var url = urlParse(options.url, {}, // Don't use current browser location
      true // Parse query strings
      ); // Normalize timeouts

      options.timeout = normalizeTimeout(options.timeout); // Shallow-merge (override) existing query params

      if (options.query) {
        url.query = objectAssign({}, url.query, removeUndefined(options.query));
      } // Implicit POST if we have not specified a method but have a body


      options.method = options.body && !options.method ? 'POST' : (options.method || 'GET').toUpperCase(); // Stringify URL

      options.url = url.toString(stringifyQueryString);
      return options;
    };

    function stringifyQueryString(obj) {
      var pairs = [];

      for (var key in obj) {
        if (has.call(obj, key)) {
          push(key, obj[key]);
        }
      }

      return pairs.length ? pairs.join('&') : '';

      function push(key, val) {
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            return push(key, item);
          });
        } else {
          pairs.push([key, val].map(encodeURIComponent).join('='));
        }
      }
    }

    function normalizeTimeout(time) {
      if (time === false || time === 0) {
        return false;
      }

      if (time.connect || time.socket) {
        return time;
      }

      var delay = Number(time);

      if (isNaN(delay)) {
        return normalizeTimeout(defaultOptions.timeout);
      }

      return {
        connect: delay,
        socket: delay
      };
    }

    function removeUndefined(obj) {
      var target = {};

      for (var key in obj) {
        if (obj[key] !== undefined) {
          target[key] = obj[key];
        }
      }

      return target;
    }

    var validUrl = /^https?:\/\//i;

    var defaultOptionsValidator = function (options) {
      if (!validUrl.test(options.url)) {
        throw new Error("\"".concat(options.url, "\" is not a valid URL"));
      }
    };

    /**
     * This file is only used for the browser version of `same-origin`.
     * Used to bring down the size of the browser bundle.
     */

    var regex = /^(?:(?:(?:([^:\/#\?]+:)?(?:(?:\/\/)((?:((?:[^:@\/#\?]+)(?:\:(?:[^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    var urlParser = {
        regex: regex,
        parse: function(url) {
            var match = regex.exec(url);
            if (!match) {
                return {};
            }

            return {
                protocol: (match[1] || '').toLowerCase() || undefined,
                hostname: (match[5] || '').toLowerCase() || undefined,
                port: match[6] || undefined
            };
        }
    };

    var sameOrigin = function(uri1, uri2, ieMode) {
        if (uri1 === uri2) {
            return true;
        }

        var url1 = urlParser.parse(uri1, false, true);
        var url2 = urlParser.parse(uri2, false, true);

        var url1Port = url1.port|0 || (url1.protocol === 'https' ? 443 : 80);
        var url2Port = url2.port|0 || (url2.protocol === 'https' ? 443 : 80);

        var match = {
            proto: url1.protocol === url2.protocol,
            hostname: url1.hostname === url2.hostname,
            port: url1Port === url2Port
        };

        return ((match.proto && match.hostname) && (match.port || ieMode));
    };

    var trim = function(string) {
      return string.replace(/^\s+|\s+$/g, '');
    }
      , isArray = function(arg) {
          return Object.prototype.toString.call(arg) === '[object Array]';
        };

    var parseHeaders = function (headers) {
      if (!headers)
        return {}

      var result = {};

      var headersArr = trim(headers).split('\n');

      for (var i = 0; i < headersArr.length; i++) {
        var row = headersArr[i];
        var index = row.indexOf(':')
        , key = trim(row.slice(0, index)).toLowerCase()
        , value = trim(row.slice(index + 1));

        if (typeof(result[key]) === 'undefined') {
          result[key] = value;
        } else if (isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [ result[key], value ];
        }
      }

      return result
    };

    /**
     * Mimicks the XMLHttpRequest API with only the parts needed for get-it's XHR adapter
     */
    function FetchXhr() {
      this.readyState = 0; // Unsent
    }

    FetchXhr.prototype.open = function (method, url) {
      this._method = method;
      this._url = url;
      this._resHeaders = '';
      this.readyState = 1; // Open

      this.onreadystatechange();
    };

    FetchXhr.prototype.abort = function () {
      if (this._controller) {
        this._controller.abort();
      }
    };

    FetchXhr.prototype.getAllResponseHeaders = function () {
      return this._resHeaders;
    };

    FetchXhr.prototype.setRequestHeader = function (key, value) {
      this._headers = this._headers || {};
      this._headers[key] = value;
    };

    FetchXhr.prototype.send = function (body) {
      var _this = this;

      // eslint-disable-next-line no-multi-assign
      var ctrl = this._controller = typeof AbortController === 'function' && new AbortController();
      var textBody = this.responseType !== 'arraybuffer';
      var options = {
        method: this._method,
        headers: this._headers,
        signal: ctrl && ctrl.signal,
        body: body
      }; // Some environments (like CloudFlare workers) don't support credentials in
      // RequestInitDict, and there doesn't seem to be any easy way to check for it,
      // so for now let's just make do with a window check :/

      if (typeof window !== 'undefined') {
        options.credentials = this.withCredentials ? 'include' : 'omit';
      }

      fetch(this._url, options).then(function (res) {
        res.headers.forEach(function (value, key) {
          _this._resHeaders += "".concat(key, ": ").concat(value, "\r\n");
        });
        _this.status = res.status;
        _this.statusText = res.statusText;
        _this.readyState = 3; // Loading

        return textBody ? res.text() : res.arrayBuffer();
      }).then(function (resBody) {
        if (textBody) {
          _this.responseText = resBody;
        } else {
          _this.response = resBody;
        }

        _this.readyState = 4; // Done

        _this.onreadystatechange();
      }).catch(function (err) {
        if (err.name === 'AbortError') {
          _this.onabort();

          return;
        }

        _this.onerror(err);
      });
    };

    var fetchXhr = FetchXhr;

    /* eslint max-depth: ["error", 4] */






    var noop = function noop() {
      /* intentional noop */
    };

    var win = typeof window === 'undefined' ? undefined : window;
    var adapter = win ? 'xhr' : 'fetch';
    var XmlHttpRequest = typeof XMLHttpRequest === 'function' ? XMLHttpRequest : noop;
    var hasXhr2 = ('withCredentials' in new XmlHttpRequest()); // eslint-disable-next-line no-undef

    var XDR = typeof XDomainRequest === 'undefined' ? undefined : XDomainRequest;
    var CrossDomainRequest = hasXhr2 ? XmlHttpRequest : XDR; // Fallback to fetch-based XHR polyfill for non-browser environments like Workers

    if (!win) {
      XmlHttpRequest = fetchXhr;
      CrossDomainRequest = fetchXhr;
    }

    var browserRequest = function (context, callback) {
      var opts = context.options;
      var options = context.applyMiddleware('finalizeOptions', opts);
      var timers = {}; // Deep-checking window.location because of react native, where `location` doesn't exist

      var cors = win && win.location && !sameOrigin(win.location.href, options.url); // Allow middleware to inject a response, for instance in the case of caching or mocking

      var injectedResponse = context.applyMiddleware('interceptRequest', undefined, {
        adapter: adapter,
        context: context
      }); // If middleware injected a response, treat it as we normally would and return it
      // Do note that the injected response has to be reduced to a cross-environment friendly response

      if (injectedResponse) {
        var cbTimer = setTimeout(callback, 0, null, injectedResponse);

        var cancel = function cancel() {
          return clearTimeout(cbTimer);
        };

        return {
          abort: cancel
        };
      } // We'll want to null out the request on success/failure


      var xhr = cors ? new CrossDomainRequest() : new XmlHttpRequest();
      var isXdr = win && win.XDomainRequest && xhr instanceof win.XDomainRequest;
      var headers = options.headers;
      var delays = options.timeout; // Request state

      var aborted = false;
      var loaded = false;
      var timedOut = false; // Apply event handlers

      xhr.onerror = onError;
      xhr.ontimeout = onError;

      xhr.onabort = function () {
        stopTimers(true);
        aborted = true;
      }; // IE9 must have onprogress be set to a unique function


      xhr.onprogress = function () {
        /* intentional noop */
      };

      var loadEvent = isXdr ? 'onload' : 'onreadystatechange';

      xhr[loadEvent] = function () {
        // Prevent request from timing out
        resetTimers();

        if (aborted || xhr.readyState !== 4 && !isXdr) {
          return;
        } // Will be handled by onError


        if (xhr.status === 0) {
          return;
        }

        onLoad();
      }; // @todo two last options to open() is username/password


      xhr.open(options.method, options.url, true // Always async
      ); // Some options need to be applied after open

      xhr.withCredentials = !!options.withCredentials; // Set headers

      if (headers && xhr.setRequestHeader) {
        for (var key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      } else if (headers && isXdr) {
        throw new Error('Headers cannot be set on an XDomainRequest object');
      }

      if (options.rawBody) {
        xhr.responseType = 'arraybuffer';
      } // Let middleware know we're about to do a request


      context.applyMiddleware('onRequest', {
        options: options,
        adapter: adapter,
        request: xhr,
        context: context
      });
      xhr.send(options.body || null); // Figure out which timeouts to use (if any)

      if (delays) {
        timers.connect = setTimeout(function () {
          return timeoutRequest('ETIMEDOUT');
        }, delays.connect);
      }

      return {
        abort: abort
      };

      function abort() {
        aborted = true;

        if (xhr) {
          xhr.abort();
        }
      }

      function timeoutRequest(code) {
        timedOut = true;
        xhr.abort();
        var error = new Error(code === 'ESOCKETTIMEDOUT' ? "Socket timed out on request to ".concat(options.url) : "Connection timed out on request to ".concat(options.url));
        error.code = code;
        context.channels.error.publish(error);
      }

      function resetTimers() {
        if (!delays) {
          return;
        }

        stopTimers();
        timers.socket = setTimeout(function () {
          return timeoutRequest('ESOCKETTIMEDOUT');
        }, delays.socket);
      }

      function stopTimers(force) {
        // Only clear the connect timeout if we've got a connection
        if (force || aborted || xhr.readyState >= 2 && timers.connect) {
          clearTimeout(timers.connect);
        }

        if (timers.socket) {
          clearTimeout(timers.socket);
        }
      }

      function onError(error) {
        if (loaded) {
          return;
        } // Clean up


        stopTimers(true);
        loaded = true;
        xhr = null; // Annoyingly, details are extremely scarce and hidden from us.
        // We only really know that it is a network error

        var err = error || new Error("Network error while attempting to reach ".concat(options.url));
        err.isNetworkError = true;
        err.request = options;
        callback(err);
      }

      function reduceResponse() {
        var statusCode = xhr.status;
        var statusMessage = xhr.statusText;

        if (isXdr && statusCode === undefined) {
          // IE8 CORS GET successful response doesn't have a status field, but body is fine
          statusCode = 200;
        } else if (statusCode > 12000 && statusCode < 12156) {
          // Yet another IE quirk where it emits weird status codes on network errors
          // https://support.microsoft.com/en-us/kb/193625
          return onError();
        } else {
          // Another IE bug where HTTP 204 somehow ends up as 1223
          statusCode = xhr.status === 1223 ? 204 : xhr.status;
          statusMessage = xhr.status === 1223 ? 'No Content' : statusMessage;
        }

        return {
          body: xhr.response || xhr.responseText,
          url: options.url,
          method: options.method,
          headers: isXdr ? {} : parseHeaders(xhr.getAllResponseHeaders()),
          statusCode: statusCode,
          statusMessage: statusMessage
        };
      }

      function onLoad() {
        if (aborted || loaded || timedOut) {
          return;
        }

        if (xhr.status === 0) {
          onError(new Error('Unknown XHR error'));
          return;
        } // Prevent being called twice


        stopTimers();
        loaded = true;
        callback(null, reduceResponse());
      }
    };

    var request$1 = browserRequest;

    // node-request in node, browser-request in browsers


    var channelNames = ['request', 'response', 'progress', 'error', 'abort'];
    var middlehooks = ['processOptions', 'validateOptions', 'interceptRequest', 'finalizeOptions', 'onRequest', 'onResponse', 'onError', 'onReturn', 'onHeaders'];

    var lib = function createRequester() {
      var initMiddleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var httpRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : request$1;
      var loadedMiddleware = [];
      var middleware = middlehooks.reduce(function (ware, name) {
        ware[name] = ware[name] || [];
        return ware;
      }, {
        processOptions: [defaultOptionsProcessor],
        validateOptions: [defaultOptionsValidator]
      });

      function request(opts) {
        var channels = channelNames.reduce(function (target, name) {
          target[name] = nanoPubsub();
          return target;
        }, {}); // Prepare a middleware reducer that can be reused throughout the lifecycle

        var applyMiddleware = middlewareReducer(middleware); // Parse the passed options

        var options = applyMiddleware('processOptions', opts); // Validate the options

        applyMiddleware('validateOptions', options); // Build a context object we can pass to child handlers

        var context = {
          options: options,
          channels: channels,
          applyMiddleware: applyMiddleware
        }; // We need to hold a reference to the current, ongoing request,
        // in order to allow cancellation. In the case of the retry middleware,
        // a new request might be triggered

        var ongoingRequest = null;
        var unsubscribe = channels.request.subscribe(function (ctx) {
          // Let request adapters (node/browser) perform the actual request
          ongoingRequest = httpRequest(ctx, function (err, res) {
            return onResponse(err, res, ctx);
          });
        }); // If we abort the request, prevent further requests from happening,
        // and be sure to cancel any ongoing request (obviously)

        channels.abort.subscribe(function () {
          unsubscribe();

          if (ongoingRequest) {
            ongoingRequest.abort();
          }
        }); // See if any middleware wants to modify the return value - for instance
        // the promise or observable middlewares

        var returnValue = applyMiddleware('onReturn', channels, context); // If return value has been modified by a middleware, we expect the middleware
        // to publish on the 'request' channel. If it hasn't been modified, we want to
        // trigger it right away

        if (returnValue === channels) {
          channels.request.publish(context);
        }

        return returnValue;

        function onResponse(reqErr, res, ctx) {
          var error = reqErr;
          var response = res; // We're processing non-errors first, in case a middleware converts the
          // response into an error (for instance, status >= 400 == HttpError)

          if (!error) {
            try {
              response = applyMiddleware('onResponse', res, ctx);
            } catch (err) {
              response = null;
              error = err;
            }
          } // Apply error middleware - if middleware return the same (or a different) error,
          // publish as an error event. If we *don't* return an error, assume it has been handled


          error = error && applyMiddleware('onError', error, ctx); // Figure out if we should publish on error/response channels

          if (error) {
            channels.error.publish(error);
          } else if (response) {
            channels.response.publish(response);
          }
        }
      }

      request.use = function use(newMiddleware) {
        if (!newMiddleware) {
          throw new Error('Tried to add middleware that resolved to falsey value');
        }

        if (typeof newMiddleware === 'function') {
          throw new Error('Tried to add middleware that was a function. It probably expects you to pass options to it.');
        }

        if (newMiddleware.onReturn && middleware.onReturn.length > 0) {
          throw new Error('Tried to add new middleware with `onReturn` handler, but another handler has already been registered for this event');
        }

        middlehooks.forEach(function (key) {
          if (newMiddleware[key]) {
            middleware[key].push(newMiddleware[key]);
          }
        });
        loadedMiddleware.push(newMiddleware);
        return request;
      };

      request.clone = function clone() {
        return createRequester(loadedMiddleware);
      };

      initMiddleware.forEach(request.use);
      return request;
    };

    var getIt = lib;

    var global$1 = createCommonjsModule(function (module) {

    /* global globalThis */

    /* eslint-disable no-negated-condition */
    if (typeof globalThis !== 'undefined') {
      module.exports = globalThis;
    } else if (typeof window !== 'undefined') {
      module.exports = window;
    } else if (typeof commonjsGlobal !== 'undefined') {
      module.exports = commonjsGlobal;
    } else if (typeof self !== 'undefined') {
      module.exports = self;
    } else {
      module.exports = {};
    }

    });

    var observable = function () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var Observable = opts.implementation || global$1.Observable;

      if (!Observable) {
        throw new Error('`Observable` is not available in global scope, and no implementation was passed');
      }

      return {
        onReturn: function onReturn(channels, context) {
          return new Observable(function (observer) {
            channels.error.subscribe(function (err) {
              return observer.error(err);
            });
            channels.progress.subscribe(function (event) {
              return observer.next(objectAssign({
                type: 'progress'
              }, event));
            });
            channels.response.subscribe(function (response) {
              observer.next(objectAssign({
                type: 'response'
              }, response));
              observer.complete();
            });
            channels.request.publish(context);
            return function () {
              return channels.abort.publish();
            };
          });
        }
      };
    };

    /*!
     * isobject <https://github.com/jonschlinkert/isobject>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    var isobject = function isObject(val) {
      return val != null && typeof val === 'object' && Array.isArray(val) === false;
    };

    /*!
     * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */



    function isObjectObject(o) {
      return isobject(o) === true
        && Object.prototype.toString.call(o) === '[object Object]';
    }

    var isPlainObject = function isPlainObject(o) {
      var ctor,prot;

      if (isObjectObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (typeof ctor !== 'function') return false;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObjectObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    };

    function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }





    var serializeTypes = ['boolean', 'string', 'number'];

    var isBuffer = function isBuffer(obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
    };

    var jsonRequest = function () {
      return {
        processOptions: function processOptions(options) {
          var body = options.body;

          if (!body) {
            return options;
          }

          var isStream = typeof body.pipe === 'function';
          var shouldSerialize = !isStream && !isBuffer(body) && (serializeTypes.indexOf(_typeof(body)) !== -1 || Array.isArray(body) || isPlainObject(body));

          if (!shouldSerialize) {
            return options;
          }

          return objectAssign({}, options, {
            body: JSON.stringify(options.body),
            headers: objectAssign({}, options.headers, {
              'Content-Type': 'application/json'
            })
          });
        }
      };
    };

    var jsonResponse = function (opts) {
      return {
        onResponse: function onResponse(response) {
          var contentType = response.headers['content-type'] || '';
          var shouldDecode = opts && opts.force || contentType.indexOf('application/json') !== -1;

          if (!response.body || !contentType || !shouldDecode) {
            return response;
          }

          return objectAssign({}, response, {
            body: tryParse(response.body)
          });
        },
        processOptions: function processOptions(options) {
          return objectAssign({}, options, {
            headers: objectAssign({
              Accept: 'application/json'
            }, options.headers)
          });
        }
      };
    };

    function tryParse(body) {
      try {
        return JSON.parse(body);
      } catch (err) {
        err.message = "Failed to parsed response body as JSON: ".concat(err.message);
        throw err;
      }
    }

    var browserProgress = function () {
      return {
        onRequest: function onRequest(evt) {
          if (evt.adapter !== 'xhr') {
            return;
          }

          var xhr = evt.request;
          var context = evt.context;

          if ('upload' in xhr && 'onprogress' in xhr.upload) {
            xhr.upload.onprogress = handleProgress('upload');
          }

          if ('onprogress' in xhr) {
            xhr.onprogress = handleProgress('download');
          }

          function handleProgress(stage) {
            return function (event) {
              var percent = event.lengthComputable ? event.loaded / event.total * 100 : -1;
              context.channels.progress.publish({
                stage: stage,
                percent: percent,
                total: event.total,
                loaded: event.loaded,
                lengthComputable: event.lengthComputable
              });
            };
          }
        }
      };
    };

    var progress = browserProgress;

    var makeError_1 = createCommonjsModule(function (module, exports) {

    // ===================================================================

    var construct = typeof Reflect !== "undefined" ? Reflect.construct : undefined;
    var defineProperty = Object.defineProperty;

    // -------------------------------------------------------------------

    var captureStackTrace = Error.captureStackTrace;
    if (captureStackTrace === undefined) {
      captureStackTrace = function captureStackTrace(error) {
        var container = new Error();

        defineProperty(error, "stack", {
          configurable: true,
          get: function getStack() {
            var stack = container.stack;

            // Replace property with value for faster future accesses.
            defineProperty(this, "stack", {
              configurable: true,
              value: stack,
              writable: true,
            });

            return stack;
          },
          set: function setStack(stack) {
            defineProperty(error, "stack", {
              configurable: true,
              value: stack,
              writable: true,
            });
          },
        });
      };
    }

    // -------------------------------------------------------------------

    function BaseError(message) {
      if (message !== undefined) {
        defineProperty(this, "message", {
          configurable: true,
          value: message,
          writable: true,
        });
      }

      var cname = this.constructor.name;
      if (cname !== undefined && cname !== this.name) {
        defineProperty(this, "name", {
          configurable: true,
          value: cname,
          writable: true,
        });
      }

      captureStackTrace(this, this.constructor);
    }

    BaseError.prototype = Object.create(Error.prototype, {
      // See: https://github.com/JsCommunity/make-error/issues/4
      constructor: {
        configurable: true,
        value: BaseError,
        writable: true,
      },
    });

    // -------------------------------------------------------------------

    // Sets the name of a function if possible (depends of the JS engine).
    var setFunctionName = (function() {
      function setFunctionName(fn, name) {
        return defineProperty(fn, "name", {
          configurable: true,
          value: name,
        });
      }
      try {
        var f = function() {};
        setFunctionName(f, "foo");
        if (f.name === "foo") {
          return setFunctionName;
        }
      } catch (_) {}
    })();

    // -------------------------------------------------------------------

    function makeError(constructor, super_) {
      if (super_ == null || super_ === Error) {
        super_ = BaseError;
      } else if (typeof super_ !== "function") {
        throw new TypeError("super_ should be a function");
      }

      var name;
      if (typeof constructor === "string") {
        name = constructor;
        constructor =
          construct !== undefined
            ? function() {
                return construct(super_, arguments, this.constructor);
              }
            : function() {
                super_.apply(this, arguments);
              };

        // If the name can be set, do it once and for all.
        if (setFunctionName !== undefined) {
          setFunctionName(constructor, name);
          name = undefined;
        }
      } else if (typeof constructor !== "function") {
        throw new TypeError("constructor should be either a string or a function");
      }

      // Also register the super constructor also as `constructor.super_` just
      // like Node's `util.inherits()`.
      //
      // eslint-disable-next-line dot-notation
      constructor.super_ = constructor["super"] = super_;

      var properties = {
        constructor: {
          configurable: true,
          value: constructor,
          writable: true,
        },
      };

      // If the name could not be set on the constructor, set it on the
      // prototype.
      if (name !== undefined) {
        properties.name = {
          configurable: true,
          value: name,
          writable: true,
        };
      }
      constructor.prototype = Object.create(super_.prototype, properties);

      return constructor;
    }
    exports = module.exports = makeError;
    exports.BaseError = BaseError;
    });

    function ClientError$1(res) {
      var props = extractErrorProps(res);
      ClientError$1.super.call(this, props.message);
      objectAssign(this, props);
    }

    function ServerError$1(res) {
      var props = extractErrorProps(res);
      ServerError$1.super.call(this, props.message);
      objectAssign(this, props);
    }

    function extractErrorProps(res) {
      var body = res.body;
      var props = {
        response: res,
        statusCode: res.statusCode,
        responseBody: stringifyBody(body, res)
      }; // API/Boom style errors ({statusCode, error, message})

      if (body.error && body.message) {
        props.message = "".concat(body.error, " - ").concat(body.message);
        return props;
      } // Query/database errors ({error: {description, other, arb, props}})


      if (body.error && body.error.description) {
        props.message = body.error.description;
        props.details = body.error;
        return props;
      } // Other, more arbitrary errors


      props.message = body.error || body.message || httpErrorMessage(res);
      return props;
    }

    function httpErrorMessage(res) {
      var statusMessage = res.statusMessage ? " ".concat(res.statusMessage) : '';
      return "".concat(res.method, "-request to ").concat(res.url, " resulted in HTTP ").concat(res.statusCode).concat(statusMessage);
    }

    function stringifyBody(body, res) {
      var contentType = (res.headers['content-type'] || '').toLowerCase();
      var isJson = contentType.indexOf('application/json') !== -1;
      return isJson ? JSON.stringify(body, null, 2) : body;
    }

    makeError_1(ClientError$1);
    makeError_1(ServerError$1);
    var ClientError_1 = ClientError$1;
    var ServerError_1 = ServerError$1;

    var errors = {
    	ClientError: ClientError_1,
    	ServerError: ServerError_1
    };

    var browserMiddleware = [];

    /* eslint-disable no-empty-function, no-process-env */












    var Observable$1 = observable$1.Observable;

    var ClientError = errors.ClientError,
        ServerError = errors.ServerError;

    var httpError = {
      onResponse: function onResponse(res) {
        if (res.statusCode >= 500) {
          throw new ServerError(res);
        } else if (res.statusCode >= 400) {
          throw new ClientError(res);
        }

        return res;
      }
    };
    var printWarnings = {
      onResponse: function onResponse(res) {
        var warn = res.headers['x-sanity-warning'];
        var warnings = Array.isArray(warn) ? warn : [warn];
        warnings.filter(Boolean).forEach(function (msg) {
          return console.warn(msg);
        }); // eslint-disable-line no-console

        return res;
      }
    }; // Environment-specific middleware.



    var middleware = browserMiddleware.concat([printWarnings, jsonRequest(), jsonResponse(), progress(), httpError, observable({
      implementation: Observable$1
    })]);
    var request = getIt(middleware);

    function httpRequest(options) {
      var requester = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : request;
      return requester(objectAssign({
        maxRedirects: 0
      }, options));
    }

    httpRequest.defaultRequester = request;
    httpRequest.ClientError = ClientError;
    httpRequest.ServerError = ServerError;
    var request_1 = httpRequest;

    var projectHeader = 'X-Sanity-Project-ID';

    var requestOptions = function (config) {
      var overrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var headers = {};
      var token = overrides.token || config.token;

      if (token) {
        headers.Authorization = "Bearer ".concat(token);
      }

      if (!overrides.useGlobalApi && !config.useProjectHostname && config.projectId) {
        headers[projectHeader] = config.projectId;
      }

      var withCredentials = Boolean(typeof overrides.withCredentials === 'undefined' ? config.token || config.withCredentials : overrides.withCredentials);
      var timeout = typeof overrides.timeout === 'undefined' ? config.timeout : overrides.timeout;
      return objectAssign({}, overrides, {
        headers: objectAssign({}, headers, overrides.headers || {}),
        timeout: typeof timeout === 'undefined' ? 5 * 60 * 1000 : timeout,
        proxy: overrides.proxy || config.proxy,
        json: true,
        withCredentials: withCredentials
      });
    };

    var generateHelpUrl_cjs = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports,"__esModule",{value:!0});exports[Symbol.toStringTag]="Module";const t="https://docs.sanity.io/help/";function r(e){return t+e}exports.generateHelpUrl=r;

    });

    var once = function (fn) {
      var didCall = false;
      var returnValue;
      return function () {
        if (didCall) {
          return returnValue;
        }

        returnValue = fn.apply(void 0, arguments);
        didCall = true;
        return returnValue;
      };
    };

    var require$$0 = generateHelpUrl_cjs;

    var generateHelpUrl = require$$0.generateHelpUrl;



    var createWarningPrinter = function createWarningPrinter(message) {
      return (// eslint-disable-next-line no-console
        once(function () {
          var _console;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_console = console).warn.apply(_console, [message.join(' ')].concat(args));
        })
      );
    };

    var printCdnWarning = createWarningPrinter(['You are not using the Sanity CDN. That means your data is always fresh, but the CDN is faster and', "cheaper. Think about it! For more info, see ".concat(generateHelpUrl('js-client-cdn-configuration'), "."), 'To hide this warning, please set the `useCdn` option to either `true` or `false` when creating', 'the client.']);
    var printBrowserTokenWarning = createWarningPrinter(['You have configured Sanity client to use a token in the browser. This may cause unintentional security issues.', "See ".concat(generateHelpUrl('js-client-browser-token'), " for more information and how to hide this warning.")]);
    var printNoApiVersionSpecifiedWarning = createWarningPrinter(['Using the Sanity client without specifying an API version is deprecated.', "See ".concat(generateHelpUrl('js-client-api-version'))]);

    var warnings = {
    	printCdnWarning: printCdnWarning,
    	printBrowserTokenWarning: printBrowserTokenWarning,
    	printNoApiVersionSpecifiedWarning: printNoApiVersionSpecifiedWarning
    };

    var config = createCommonjsModule(function (module, exports) {

    var generateHelpUrl = require$$0.generateHelpUrl;







    var defaultCdnHost = 'apicdn.sanity.io';
    var defaultConfig = {
      apiHost: 'https://api.sanity.io',
      apiVersion: '1',
      useProjectHostname: true,
      isPromiseAPI: true
    };
    var LOCALHOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

    var isLocal = function isLocal(host) {
      return LOCALHOSTS.indexOf(host) !== -1;
    };

    exports.defaultConfig = defaultConfig; // eslint-disable-next-line complexity

    exports.initConfig = function (config, prevConfig) {
      var specifiedConfig = objectAssign({}, prevConfig, config);

      if (!specifiedConfig.apiVersion) {
        warnings.printNoApiVersionSpecifiedWarning();
      }

      var newConfig = objectAssign({}, defaultConfig, specifiedConfig);
      var projectBased = newConfig.useProjectHostname;

      if (typeof Promise === 'undefined') {
        var helpUrl = generateHelpUrl('js-client-promise-polyfill');
        throw new Error("No native Promise-implementation found, polyfill needed - see ".concat(helpUrl));
      }

      if (projectBased && !newConfig.projectId) {
        throw new Error('Configuration must contain `projectId`');
      }

      var isBrowser = typeof window !== 'undefined' && window.location && window.location.hostname;
      var isLocalhost = isBrowser && isLocal(window.location.hostname);

      if (isBrowser && isLocalhost && newConfig.token && newConfig.ignoreBrowserTokenWarning !== true) {
        warnings.printBrowserTokenWarning();
      } else if (typeof newConfig.useCdn === 'undefined') {
        warnings.printCdnWarning();
      }

      if (projectBased) {
        validators.projectId(newConfig.projectId);
      }

      if (newConfig.dataset) {
        validators.dataset(newConfig.dataset);
      }

      if ('requestTagPrefix' in newConfig) {
        // Allow setting and unsetting request tag prefix
        newConfig.requestTagPrefix = newConfig.requestTagPrefix ? validators.requestTag(newConfig.requestTagPrefix).replace(/\.+$/, '') : undefined;
      }

      newConfig.apiVersion = "".concat(newConfig.apiVersion).replace(/^v/, '');
      newConfig.isDefaultApi = newConfig.apiHost === defaultConfig.apiHost;
      newConfig.useCdn = Boolean(newConfig.useCdn) && !newConfig.withCredentials;
      exports.validateApiVersion(newConfig.apiVersion);
      var hostParts = newConfig.apiHost.split('://', 2);
      var protocol = hostParts[0];
      var host = hostParts[1];
      var cdnHost = newConfig.isDefaultApi ? defaultCdnHost : host;

      if (newConfig.useProjectHostname) {
        newConfig.url = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(host, "/v").concat(newConfig.apiVersion);
        newConfig.cdnUrl = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(cdnHost, "/v").concat(newConfig.apiVersion);
      } else {
        newConfig.url = "".concat(newConfig.apiHost, "/v").concat(newConfig.apiVersion);
        newConfig.cdnUrl = newConfig.url;
      }

      return newConfig;
    };

    exports.validateApiVersion = function validateApiVersion(apiVersion) {
      if (apiVersion === '1' || apiVersion === 'X') {
        return;
      }

      var apiDate = new Date(apiVersion);
      var apiVersionValid = /^\d{4}-\d{2}-\d{2}$/.test(apiVersion) && apiDate instanceof Date && apiDate.getTime() > 0;

      if (!apiVersionValid) {
        throw new Error('Invalid API version string, expected `1` or date in format `YYYY-MM-DD`');
      }
    };
    });

    function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



    var Observable = observable$1.Observable,
        map = observable$1.map,
        filter = observable$1.filter;





















    var defaultConfig = config.defaultConfig,
        initConfig = config.initConfig;



    var toPromise = function toPromise(observable) {
      return observable.toPromise();
    };

    function SanityClient() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;

      if (!(this instanceof SanityClient)) {
        return new SanityClient(config);
      }

      this.config(config);
      this.assets = new assetsClient(this);
      this.datasets = new datasetsClient(this);
      this.projects = new projectsClient(this);
      this.users = new usersClient(this);
      this.auth = new authClient(this);

      if (this.clientConfig.isPromiseAPI) {
        var observableConfig = objectAssign({}, this.clientConfig, {
          isPromiseAPI: false
        });
        this.observable = new SanityClient(observableConfig);
      }
    }

    objectAssign(SanityClient.prototype, dataMethods);
    objectAssign(SanityClient.prototype, {
      clone: function clone() {
        return new SanityClient(this.config());
      },
      config: function config(newConfig) {
        if (typeof newConfig === 'undefined') {
          return objectAssign({}, this.clientConfig);
        }

        if (this.observable) {
          var observableConfig = objectAssign({}, newConfig, {
            isPromiseAPI: false
          });
          this.observable.config(observableConfig);
        }

        this.clientConfig = initConfig(newConfig, this.clientConfig || {});
        return this;
      },
      withConfig: function withConfig(newConfig) {
        return this.clone().config(newConfig);
      },
      getUrl: function getUrl(uri) {
        var useCdn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var base = useCdn ? this.clientConfig.cdnUrl : this.clientConfig.url;
        return "".concat(base, "/").concat(uri.replace(/^\//, ''));
      },
      isPromiseAPI: function isPromiseAPI() {
        return this.clientConfig.isPromiseAPI;
      },
      _requestObservable: function _requestObservable(options) {
        var _this = this;

        var uri = options.url || options.uri; // If the `canUseCdn`-option is not set we detect it automatically based on the method + URL.
        // Only the /data endpoint is currently available through API-CDN.

        var canUseCdn = typeof options.canUseCdn === 'undefined' ? ['GET', 'HEAD'].indexOf(options.method || 'GET') >= 0 && uri.indexOf('/data/') === 0 : options.canUseCdn;
        var useCdn = this.clientConfig.useCdn && canUseCdn;
        var tag = options.tag && this.clientConfig.requestTagPrefix ? [this.clientConfig.requestTagPrefix, options.tag].join('.') : options.tag || this.clientConfig.requestTagPrefix;

        if (tag) {
          options.query = _objectSpread({
            tag: validators.requestTag(tag)
          }, options.query);
        }

        var reqOptions = requestOptions(this.clientConfig, objectAssign({}, options, {
          url: this.getUrl(uri, useCdn)
        }));
        return new Observable(function (subscriber) {
          return request_1(reqOptions, _this.clientConfig.requester).subscribe(subscriber);
        });
      },
      request: function request(options) {
        var observable = this._requestObservable(options).pipe(filter(function (event) {
          return event.type === 'response';
        }), map(function (event) {
          return event.body;
        }));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      }
    });
    SanityClient.Patch = patch;
    SanityClient.Transaction = transaction;
    SanityClient.ClientError = request_1.ClientError;
    SanityClient.ServerError = request_1.ServerError;
    SanityClient.requester = request_1.defaultRequester;
    var sanityClient = SanityClient;

    const client = sanityClient({
        projectId: "3i4cmt4j",
        dataset: "production",
        apiVersion: "v1",
        useCdn: true,
    });

    /* src/Publications/Publications.svelte generated by Svelte v3.44.3 */
    const file$7 = "src/Publications/Publications.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if publications.length > 0}
    function create_if_block$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*publications*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Publications";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$7, 14, 4, 361);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$7, 13, 2, 329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publications*/ 1) {
    				each_value = /*publications*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(13:0) {#if publications.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each publications as publication}
    function create_each_block$4(ctx) {
    	let publicationscard;
    	let current;

    	publicationscard = new PublicationsCard({
    			props: {
    				name: /*publication*/ ctx[2].name,
    				authors: /*publication*/ ctx[2].authors.join(", "),
    				journal: /*publication*/ ctx[2].journal,
    				link: /*publication*/ ctx[2].link
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(publicationscard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(publicationscard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const publicationscard_changes = {};
    			if (dirty & /*publications*/ 1) publicationscard_changes.name = /*publication*/ ctx[2].name;
    			if (dirty & /*publications*/ 1) publicationscard_changes.authors = /*publication*/ ctx[2].authors.join(", ");
    			if (dirty & /*publications*/ 1) publicationscard_changes.journal = /*publication*/ ctx[2].journal;
    			if (dirty & /*publications*/ 1) publicationscard_changes.link = /*publication*/ ctx[2].link;
    			publicationscard.$set(publicationscard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(publicationscard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(publicationscard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(publicationscard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(17:4) {#each publications as publication}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*publications*/ ctx[0].length > 0 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*publications*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*publications*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Publications', slots, []);
    	const query = `*[_type == "publication"]{name, authors, link, journal}`;
    	let publications = [];

    	client.fetch(query).then(res => {
    		$$invalidate(0, publications = res);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Publications> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PublicationsCard,
    		client,
    		query,
    		publications
    	});

    	$$self.$inject_state = $$props => {
    		if ('publications' in $$props) $$invalidate(0, publications = $$props.publications);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [publications];
    }

    class Publications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Publications",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/CompetitiveProgramming/CompetitiveProgrammingCard.svelte generated by Svelte v3.44.3 */

    const file$6 = "src/CompetitiveProgramming/CompetitiveProgrammingCard.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p;
    	let span;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div0;
    	let t9;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*platformName*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			span = element("span");
    			t2 = text(/*username*/ ctx[2]);
    			t3 = text(" • ");
    			t4 = text(/*rating*/ ctx[3]);
    			t5 = text(" (");
    			t6 = text(/*ratingDescription*/ ctx[4]);
    			t7 = text(")");
    			t8 = space();
    			div0 = element("div");
    			t9 = text(/*link*/ ctx[1]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$6, 10, 4, 213);
    			attr_dev(span, "class", "font-mono");
    			add_location(span, file$6, 18, 6, 455);
    			attr_dev(p, "class", "text-sm text-muted group-hover:text-link print:text-vivid inline-block table");
    			add_location(p, file$6, 15, 4, 346);
    			attr_dev(div0, "class", "text-sm text-link hidden print:block");
    			add_location(div0, file$6, 20, 4, 550);
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$6, 9, 2, 192);
    			attr_dev(div1, "class", "group inline-block table");
    			add_location(div1, file$6, 8, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p);
    			append_dev(p, span);
    			append_dev(span, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(a, t8);
    			append_dev(a, div0);
    			append_dev(div0, t9);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*platformName*/ 1) set_data_dev(t0, /*platformName*/ ctx[0]);
    			if (dirty & /*username*/ 4) set_data_dev(t2, /*username*/ ctx[2]);
    			if (dirty & /*rating*/ 8) set_data_dev(t4, /*rating*/ ctx[3]);
    			if (dirty & /*ratingDescription*/ 16) set_data_dev(t6, /*ratingDescription*/ ctx[4]);
    			if (dirty & /*link*/ 2) set_data_dev(t9, /*link*/ ctx[1]);

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompetitiveProgrammingCard', slots, []);
    	let { platformName } = $$props;
    	let { link } = $$props;
    	let { username } = $$props;
    	let { rating } = $$props;
    	let { ratingDescription } = $$props;
    	const writable_props = ['platformName', 'link', 'username', 'rating', 'ratingDescription'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompetitiveProgrammingCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('platformName' in $$props) $$invalidate(0, platformName = $$props.platformName);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('rating' in $$props) $$invalidate(3, rating = $$props.rating);
    		if ('ratingDescription' in $$props) $$invalidate(4, ratingDescription = $$props.ratingDescription);
    	};

    	$$self.$capture_state = () => ({
    		platformName,
    		link,
    		username,
    		rating,
    		ratingDescription
    	});

    	$$self.$inject_state = $$props => {
    		if ('platformName' in $$props) $$invalidate(0, platformName = $$props.platformName);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('rating' in $$props) $$invalidate(3, rating = $$props.rating);
    		if ('ratingDescription' in $$props) $$invalidate(4, ratingDescription = $$props.ratingDescription);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [platformName, link, username, rating, ratingDescription];
    }

    class CompetitiveProgrammingCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			platformName: 0,
    			link: 1,
    			username: 2,
    			rating: 3,
    			ratingDescription: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompetitiveProgrammingCard",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*platformName*/ ctx[0] === undefined && !('platformName' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'platformName'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'link'");
    		}

    		if (/*username*/ ctx[2] === undefined && !('username' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'username'");
    		}

    		if (/*rating*/ ctx[3] === undefined && !('rating' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'rating'");
    		}

    		if (/*ratingDescription*/ ctx[4] === undefined && !('ratingDescription' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'ratingDescription'");
    		}
    	}

    	get platformName() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set platformName(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get username() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rating() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rating(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ratingDescription() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ratingDescription(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CompetitiveProgramming/CompetitiveProgramming.svelte generated by Svelte v3.44.3 */
    const file$5 = "src/CompetitiveProgramming/CompetitiveProgramming.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if platforms.length > 0}
    function create_if_block$2(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*platforms*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Competitive Programming";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$5, 14, 4, 406);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$5, 13, 2, 374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*platforms*/ 1) {
    				each_value = /*platforms*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(13:0) {#if platforms.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each platforms as platform}
    function create_each_block$3(ctx) {
    	let competitiveprogrammingcard;
    	let current;

    	competitiveprogrammingcard = new CompetitiveProgrammingCard({
    			props: {
    				platformName: /*platform*/ ctx[2].platform,
    				link: /*platform*/ ctx[2].link,
    				username: /*platform*/ ctx[2].username,
    				rating: /*platform*/ ctx[2].rating,
    				ratingDescription: /*platform*/ ctx[2].ratingDescription
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(competitiveprogrammingcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(competitiveprogrammingcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const competitiveprogrammingcard_changes = {};
    			if (dirty & /*platforms*/ 1) competitiveprogrammingcard_changes.platformName = /*platform*/ ctx[2].platform;
    			if (dirty & /*platforms*/ 1) competitiveprogrammingcard_changes.link = /*platform*/ ctx[2].link;
    			if (dirty & /*platforms*/ 1) competitiveprogrammingcard_changes.username = /*platform*/ ctx[2].username;
    			if (dirty & /*platforms*/ 1) competitiveprogrammingcard_changes.rating = /*platform*/ ctx[2].rating;
    			if (dirty & /*platforms*/ 1) competitiveprogrammingcard_changes.ratingDescription = /*platform*/ ctx[2].ratingDescription;
    			competitiveprogrammingcard.$set(competitiveprogrammingcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(competitiveprogrammingcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(competitiveprogrammingcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(competitiveprogrammingcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:4) {#each platforms as platform}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*platforms*/ ctx[0].length > 0 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*platforms*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*platforms*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompetitiveProgramming', slots, []);
    	const query = `*[_type == "competitiveProgramming"]{platform, rating, ratingDescription, username, link}`;
    	let platforms = [];

    	client.fetch(query).then(res => {
    		$$invalidate(0, platforms = res);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompetitiveProgramming> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CompetitiveProgrammingCard,
    		client,
    		query,
    		platforms
    	});

    	$$self.$inject_state = $$props => {
    		if ('platforms' in $$props) $$invalidate(0, platforms = $$props.platforms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [platforms];
    }

    class CompetitiveProgramming extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompetitiveProgramming",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Projects/ProjectsCard.svelte generated by Svelte v3.44.3 */

    const file$4 = "src/Projects/ProjectsCard.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let span;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*description*/ ctx[2]);
    			t3 = space();
    			span = element("span");
    			t4 = text(/*link*/ ctx[1]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$4, 8, 4, 153);
    			attr_dev(p, "class", "text-sm text-muted group-hover:text-link inline-block table");
    			add_location(p, file$4, 13, 4, 278);
    			attr_dev(span, "class", "text-sm text-link hidden print:block");
    			add_location(span, file$4, 16, 4, 386);
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$4, 7, 2, 132);
    			attr_dev(div, "class", "group inline-block table");
    			add_location(div, file$4, 6, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p);
    			append_dev(p, t2);
    			append_dev(a, t3);
    			append_dev(a, span);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*description*/ 4) set_data_dev(t2, /*description*/ ctx[2]);
    			if (dirty & /*link*/ 2) set_data_dev(t4, /*link*/ ctx[1]);

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectsCard', slots, []);
    	let { name } = $$props;
    	let { link } = $$props;
    	let { description } = $$props;
    	const writable_props = ['name', 'link', 'description'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectsCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ name, link, description });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, link, description];
    }

    class ProjectsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, link: 1, description: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectsCard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'name'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'link'");
    		}

    		if (/*description*/ ctx[2] === undefined && !('description' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'description'");
    		}
    	}

    	get name() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Projects/Projects.svelte generated by Svelte v3.44.3 */
    const file$3 = "src/Projects/Projects.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if projects.length > 0}
    function create_if_block$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Projects";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$3, 14, 4, 332);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$3, 13, 2, 300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(13:0) {#if projects.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each projects as project}
    function create_each_block$2(ctx) {
    	let projectscard;
    	let current;

    	projectscard = new ProjectsCard({
    			props: {
    				name: /*project*/ ctx[2].name,
    				link: /*project*/ ctx[2].link,
    				description: /*project*/ ctx[2].description
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectscard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectscard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projectscard_changes = {};
    			if (dirty & /*projects*/ 1) projectscard_changes.name = /*project*/ ctx[2].name;
    			if (dirty & /*projects*/ 1) projectscard_changes.link = /*project*/ ctx[2].link;
    			if (dirty & /*projects*/ 1) projectscard_changes.description = /*project*/ ctx[2].description;
    			projectscard.$set(projectscard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectscard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectscard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectscard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:4) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*projects*/ ctx[0].length > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*projects*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*projects*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);
    	const query = `*[_type == "project"]{name, description, link}`;
    	let projects = [];

    	client.fetch(query).then(res => {
    		$$invalidate(0, projects = res);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProjectsCard, client, query, projects });

    	$$self.$inject_state = $$props => {
    		if ('projects' in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [projects];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Contacts/ContactCard.svelte generated by Svelte v3.44.3 */

    const file$2 = "src/Contacts/ContactCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (15:4) {#each paths as path}
    function create_each_block$1(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[3]);
    			add_location(path, file$2, 15, 6, 333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paths*/ 4 && path_d_value !== (path_d_value = /*path*/ ctx[3])) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:4) {#each paths as path}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let t3;
    	let span;
    	let t4;
    	let each_value = /*paths*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(/*name*/ ctx[0]);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = text(": ");
    			span = element("span");
    			t4 = text(/*link*/ ctx[1]);
    			add_location(title, file$2, 13, 4, 277);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-7 w-7 text-vivid hover:text-link");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$2, 7, 2, 124);
    			attr_dev(a, "class", "print:hidden");
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$2, 6, 0, 84);
    			attr_dev(span, "class", "text-link");
    			add_location(span, file$2, 21, 34, 451);
    			attr_dev(div0, "class", "text-vivid");
    			add_location(div0, file$2, 21, 2, 419);
    			attr_dev(div1, "class", "hidden print:block");
    			add_location(div1, file$2, 20, 0, 383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*paths*/ 4) {
    				each_value = /*paths*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);
    			if (dirty & /*link*/ 2) set_data_dev(t4, /*link*/ ctx[1]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactCard', slots, []);
    	let { name } = $$props;
    	let { link } = $$props;
    	let { paths } = $$props;
    	const writable_props = ['name', 'link', 'paths'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('paths' in $$props) $$invalidate(2, paths = $$props.paths);
    	};

    	$$self.$capture_state = () => ({ name, link, paths });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('paths' in $$props) $$invalidate(2, paths = $$props.paths);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, link, paths];
    }

    class ContactCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, link: 1, paths: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactCard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'name'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'link'");
    		}

    		if (/*paths*/ ctx[2] === undefined && !('paths' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'paths'");
    		}
    	}

    	get name() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get paths() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set paths(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Contacts/Contacts.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/Contacts/Contacts.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (38:0) {#if officialContacts.length > 0 || unofficialContacts.length > 0}
    function create_if_block(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let span;
    	let t4;
    	let current;
    	let each_value_1 = /*officialContacts*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*unofficialContacts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contacts";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			span = element("span");
    			span.textContent = "•";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading hidden print:block");
    			add_location(h2, file$1, 39, 4, 2669);
    			attr_dev(span, "class", "text-vivid cursor-default print:hidden");
    			add_location(span, file$1, 51, 6, 3062);
    			attr_dev(div0, "class", "flex flex-row print:flex-col justify-center print:justify-left space-x-4 print:space-x-0 space-y-0");
    			add_location(div0, file$1, 40, 4, 2740);
    			attr_dev(div1, "class", "item-spacing");
    			add_location(div1, file$1, 38, 2, 2637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, span);
    			append_dev(div0, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*officialContacts*/ 1) {
    				each_value_1 = /*officialContacts*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*unofficialContacts*/ 2) {
    				each_value = /*unofficialContacts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:0) {#if officialContacts.length > 0 || unofficialContacts.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#each officialContacts as contact}
    function create_each_block_1(ctx) {
    	let contactcard;
    	let current;

    	contactcard = new ContactCard({
    			props: {
    				name: /*contact*/ ctx[2].name,
    				link: /*contact*/ ctx[2].link,
    				paths: /*contact*/ ctx[2].paths
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contactcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(44:6) {#each officialContacts as contact}",
    		ctx
    	});

    	return block;
    }

    // (54:6) {#each unofficialContacts as contact}
    function create_each_block(ctx) {
    	let contactcard;
    	let current;

    	contactcard = new ContactCard({
    			props: {
    				name: /*contact*/ ctx[2].name,
    				link: /*contact*/ ctx[2].link,
    				paths: /*contact*/ ctx[2].paths
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contactcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:6) {#each unofficialContacts as contact}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*officialContacts*/ ctx[0].length > 0 || /*unofficialContacts*/ ctx[1].length > 0) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*officialContacts*/ ctx[0].length > 0 || /*unofficialContacts*/ ctx[1].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contacts', slots, []);

    	let officialContacts = [
    		{
    			name: "Email",
    			link: "mailto:madhavanraja99@gmail.com",
    			paths: [
    				"M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
    			]
    		},
    		{
    			name: "LinkedIn",
    			link: "https://www.linkedin.com/in/madhavan-raja/",
    			paths: [
    				"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    			]
    		},
    		{
    			name: "GitHub",
    			link: "https://github.com/madhavan-raja",
    			paths: [
    				"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    			]
    		}
    	];

    	let unofficialContacts = [
    		{
    			name: "Cute Fluffy Kitten",
    			link: "https://linktr.ee/cutefluffykitten",
    			paths: [
    				"M7.953 15.066c-.08.163-.08.324-.08.486.08.517.528.897 1.052.89h1.294v4.776c0 .486-.404.89-.89.89H6.577a.898.898 0 0 1-.889-.891v-4.774H.992c-.728 0-1.214-.729-.89-1.377l6.96-12.627a1.065 1.065 0 0 1 1.863 0l2.913 5.585-3.885 7.042zm15.945 0l-6.96-12.627a1.065 1.065 0 0 0-1.862 0l-2.995 5.586 3.885 7.04c.081.164.081.326.081.487-.08.517-.529.897-1.052.89h-1.296v4.776c.005.49.4.887.89.89h2.914a.9.9 0 0 0 .892-.89v-4.775h4.612c.73 0 1.214-.729.89-1.377Z"
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contacts> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ContactCard,
    		officialContacts,
    		unofficialContacts
    	});

    	$$self.$inject_state = $$props => {
    		if ('officialContacts' in $$props) $$invalidate(0, officialContacts = $$props.officialContacts);
    		if ('unofficialContacts' in $$props) $$invalidate(1, unofficialContacts = $$props.unofficialContacts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [officialContacts, unofficialContacts];
    }

    class Contacts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contacts",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let darkmodetoggle;
    	let t0;
    	let div0;
    	let info;
    	let t1;
    	let publications;
    	let t2;
    	let competitiveprogramming;
    	let t3;
    	let projects;
    	let t4;
    	let contacts;
    	let current;
    	darkmodetoggle = new DarkModeToggle({ $$inline: true });
    	info = new Info({ $$inline: true });
    	publications = new Publications({ $$inline: true });
    	competitiveprogramming = new CompetitiveProgramming({ $$inline: true });
    	projects = new Projects({ $$inline: true });
    	contacts = new Contacts({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			create_component(darkmodetoggle.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(info.$$.fragment);
    			t1 = space();
    			create_component(publications.$$.fragment);
    			t2 = space();
    			create_component(competitiveprogramming.$$.fragment);
    			t3 = space();
    			create_component(projects.$$.fragment);
    			t4 = space();
    			create_component(contacts.$$.fragment);
    			attr_dev(div0, "class", "py-10 flex flex-col space-y-12");
    			add_location(div0, file, 26, 4, 847);
    			attr_dev(div1, "class", "px-8 sm:px-20 md:px-40 lg:px-80");
    			add_location(div1, file, 24, 2, 772);
    			add_location(main, file, 23, 0, 762);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(darkmodetoggle, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(info, div0, null);
    			append_dev(div0, t1);
    			mount_component(publications, div0, null);
    			append_dev(div0, t2);
    			mount_component(competitiveprogramming, div0, null);
    			append_dev(div0, t3);
    			mount_component(projects, div0, null);
    			append_dev(div0, t4);
    			mount_component(contacts, div0, null);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(darkmodetoggle.$$.fragment, local);
    			transition_in(info.$$.fragment, local);
    			transition_in(publications.$$.fragment, local);
    			transition_in(competitiveprogramming.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(contacts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(darkmodetoggle.$$.fragment, local);
    			transition_out(info.$$.fragment, local);
    			transition_out(publications.$$.fragment, local);
    			transition_out(competitiveprogramming.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(contacts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(darkmodetoggle);
    			destroy_component(info);
    			destroy_component(publications);
    			destroy_component(competitiveprogramming);
    			destroy_component(projects);
    			destroy_component(contacts);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let htmlClasses = document.querySelector("html").classList;

    	if (localStorage.theme === "dark" || !("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    		htmlClasses.add("dark");
    		localStorage.theme = "dark";
    	} else {
    		htmlClasses.remove("dark");
    		localStorage.removeItem("theme");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		DarkModeToggle,
    		Info,
    		Publications,
    		CompetitiveProgramming,
    		Projects,
    		Contacts,
    		htmlClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ('htmlClasses' in $$props) htmlClasses = $$props.htmlClasses;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
